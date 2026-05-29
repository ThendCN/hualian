import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../entities/member.entity';
import { MemberVehicle } from '../../entities/member-vehicle.entity';
import { PointsLog } from '../../entities/points-log.entity';
import { ConsumptionRecord } from '../../entities/consumption-record.entity';
import { MemberCoupon, MemberCouponStatus } from '../../entities/member-coupon.entity';
import { PosMemberCacheService } from '../pos-integration/pos-member-cache.service';
import { PosMemberGateway } from '../pos-integration/pos-member.gateway';

const PLATE_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁夏][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/;

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(MemberVehicle)
    private vehicleRepo: Repository<MemberVehicle>,
    @InjectRepository(PointsLog)
    private pointsLogRepo: Repository<PointsLog>,
    @InjectRepository(ConsumptionRecord)
    private consumptionRepo: Repository<ConsumptionRecord>,
    @InjectRepository(MemberCoupon)
    private couponRepo: Repository<MemberCoupon>,
    private posMemberCacheService: PosMemberCacheService,
    private posMemberGateway: PosMemberGateway,
  ) {}

  async getProfile(memberId: number) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    const coupon_count = await this.couponRepo.count({ where: { member_id: memberId, status: MemberCouponStatus.UNUSED } });
    const profile = await this.posMemberCacheService.getRealtimeProfile(member);
    return { ...profile, coupon_count };
  }

  async updateProfile(memberId: number, data: { nickname?: string; avatar?: string }) {
    const allowed: any = {};
    if (data.nickname !== undefined) allowed.nickname = data.nickname;
    if (data.avatar !== undefined) allowed.avatar = data.avatar;
    await this.memberRepo.update(memberId, allowed);
    return this.getProfile(memberId);
  }

  async getQrcode(memberId: number) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    const profile = await this.posMemberCacheService.getRealtimeProfile(member);
    return { member_no: profile.member_no, qrcode_data: profile.member_no, level: profile.level, data_freshness: profile.data_freshness, last_synced_at: profile.last_synced_at };
  }

  async getVehicles(memberId: number) {
    return this.vehicleRepo.find({ where: { member_id: memberId }, order: { is_default: 'DESC', created_at: 'ASC' } });
  }

  async addVehicle(memberId: number, plateNumber: string, plateColor = '蓝') {
    if (!PLATE_REGEX.test(plateNumber)) {
      throw new BadRequestException('车牌号格式不正确');
    }
    const existing = await this.vehicleRepo.find({ where: { member_id: memberId } });
    if (existing.some(v => v.plate_number === plateNumber)) {
      throw new BadRequestException('该车牌已绑定');
    }
    const isDefault = existing.length === 0;
    const vehicle = this.vehicleRepo.create({ member_id: memberId, plate_number: plateNumber, plate_color: plateColor, is_default: isDefault });
    return this.vehicleRepo.save(vehicle);
  }

  async deleteVehicle(memberId: number, vehicleId: number) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId, member_id: memberId } });
    if (!vehicle) throw new NotFoundException('车辆不存在');
    await this.vehicleRepo.delete(vehicleId);
    if (vehicle.is_default) {
      const remaining = await this.vehicleRepo.find({ where: { member_id: memberId }, order: { created_at: 'ASC' } });
      if (remaining.length > 0) {
        await this.vehicleRepo.update(remaining[0].id, { is_default: true });
      }
    }
    return { success: true };
  }

  async setDefaultVehicle(memberId: number, vehicleId: number) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId, member_id: memberId } });
    if (!vehicle) throw new NotFoundException('车辆不存在');
    await this.vehicleRepo.update({ member_id: memberId }, { is_default: false });
    await this.vehicleRepo.update(vehicleId, { is_default: true });
    return this.vehicleRepo.findOne({ where: { id: vehicleId } });
  }

  async getConsumptionRecords(memberId: number, page = 1, pageSize = 20) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    try {
      const keyword = member.pos_vip_no || member.member_no || member.phone;
      return await this.posMemberGateway.getConsumptionRecords({ keyword, page, pageSize });
    } catch {
      // POS 不可用时使用本地消费记录缓存。
    }

    const [list, total] = await this.consumptionRepo.findAndCount({
      where: { member_id: memberId },
      order: { consumed_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize, data_freshness: 'cached' };
  }
}
