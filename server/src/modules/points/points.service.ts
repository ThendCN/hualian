import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Member } from '../../entities/member.entity';
import { PointsLog, PointsLogType, PointsLogSource } from '../../entities/points-log.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { PosMemberGateway } from '../pos-integration/pos-member.gateway';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(PointsLog)
    private pointsLogRepo: Repository<PointsLog>,
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    private posMemberGateway: PosMemberGateway,
  ) {}

  private async getConfigValue(key: string, defaultVal: number): Promise<number> {
    const cfg = await this.configRepo.findOne({ where: { config_key: key } });
    return cfg ? parseInt(cfg.config_value, 10) : defaultVal;
  }

  async addPoints(memberId: number, points: number, source: PointsLogSource, description: string, refId?: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    const newBalance = member.total_points + points;
    await this.memberRepo.update(memberId, { total_points: newBalance });
    const log = this.pointsLogRepo.create({ member_id: memberId, type: PointsLogType.EARN, source, points, balance_after: newBalance, ref_id: refId, description });
    return this.pointsLogRepo.save(log);
  }

  async consumePoints(memberId: number, points: number, source: PointsLogSource, description: string, refId?: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    if (member.total_points < points) throw new BadRequestException('积分不足');
    const newBalance = member.total_points - points;
    await this.memberRepo.update(memberId, { total_points: newBalance });
    const log = this.pointsLogRepo.create({ member_id: memberId, type: PointsLogType.CONSUME, source, points: -points, balance_after: newBalance, ref_id: refId, description });
    return this.pointsLogRepo.save(log);
  }

  async getCheckinStatus(memberId: number) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const todayCheckin = await this.pointsLogRepo.findOne({
      where: { member_id: memberId, source: PointsLogSource.CHECKIN, created_at: Between(todayStart, todayEnd) },
    });

    let streak = 0;
    const checkDate = new Date(todayStart);
    while (streak <= 30) {
      const start = new Date(checkDate);
      const end = new Date(checkDate.getTime() + 86400000);
      const log = await this.pointsLogRepo.findOne({
        where: { member_id: memberId, source: PointsLogSource.CHECKIN, created_at: Between(start, end) },
      });
      if (!log) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { checked_today: !!todayCheckin, streak_days: streak };
  }

  async checkin(memberId: number) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const existing = await this.pointsLogRepo.findOne({
      where: { member_id: memberId, source: PointsLogSource.CHECKIN, created_at: Between(todayStart, todayEnd) },
    });
    if (existing) throw new BadRequestException('今日已签到');

    const yesterday = new Date(todayStart.getTime() - 86400000);
    const yesterdayLog = await this.pointsLogRepo.findOne({
      where: { member_id: memberId, source: PointsLogSource.CHECKIN, created_at: Between(yesterday, new Date(todayStart)) },
    });

    const dailyPoints = await this.getConfigValue('points.checkin_daily', 5);
    const streakBonus = await this.getConfigValue('points.checkin_streak_7', 50);

    const status = await this.getCheckinStatus(memberId);
    const newStreak = yesterdayLog ? status.streak_days + 1 : 1;

    let points = dailyPoints;
    let description = '每日签到';
    let bonus = 0;

    if (newStreak > 0 && newStreak % 7 === 0) {
      points += streakBonus;
      bonus = streakBonus;
      description = `连续签到${newStreak}天奖励`;
    }

    const log = await this.addPoints(memberId, points, PointsLogSource.CHECKIN, description);
    return { ...log, streak_days: newStreak, bonus };
  }

  async getLogs(memberId: number, type?: string, page = 1, pageSize = 20) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('会员不存在');
    try {
      const keyword = member.pos_vip_no || member.member_no || member.phone;
      const result = await this.posMemberGateway.getPointLogs({ keyword, page, pageSize });
      if (type) {
        result.list = result.list.filter((item: any) => item.type === type);
        result.total = result.list.length;
      }
      return result;
    } catch {
      // POS 不可用时使用本地积分日志缓存。
    }

    const where: any = { member_id: memberId };
    if (type) where.type = type;
    const [list, total] = await this.pointsLogRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize, data_freshness: 'cached' };
  }
}
