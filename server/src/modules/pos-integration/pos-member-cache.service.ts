import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberSource } from '../../entities/member.entity';
import { PosMemberGateway } from './pos-member.gateway';
import { PosMemberProfile } from './types';

export interface MemberWithFreshness extends Member {
  data_freshness: 'realtime' | 'cached';
  last_synced_at: Date | null;
  pos_balance?: number;
}

@Injectable()
export class PosMemberCacheService {
  private readonly logger = new Logger(PosMemberCacheService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    private posMemberGateway: PosMemberGateway,
  ) {}

  async getRealtimeProfile(member: Member): Promise<MemberWithFreshness> {
    try {
      const posMember = await this.posMemberGateway.findMember({
        phone: member.phone,
        posMemberId: member.pos_member_id || undefined,
        memberNo: member.pos_vip_no || member.member_no,
      });

      if (!posMember) {
        return this.withFreshness(member, 'cached');
      }

      const updated = await this.applyPosProfile(member, posMember);
      return { ...updated, data_freshness: 'realtime', last_synced_at: updated.pos_last_synced_at, pos_balance: posMember.balance };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`读取 POS 会员数据失败, member=${member.id}: ${message}`);
      await this.memberRepo.update(member.id, { pos_last_sync_error: message });
      return this.withFreshness(member, 'cached');
    }
  }

  private async applyPosProfile(member: Member, posMember: PosMemberProfile) {
    const patch: Partial<Member> = {
      total_points: posMember.total_points,
      total_consumed: posMember.total_consumed,
      year_consumed: posMember.year_consumed,
      source: MemberSource.POS_SYNC,
      pos_member_id: posMember.pos_member_id || member.pos_member_id,
      pos_vip_no: posMember.pos_vip_no || member.pos_vip_no,
      pos_last_synced_at: new Date(),
      pos_last_sync_error: null,
    };

    if (!member.nickname || member.nickname === '华联会员') {
      patch.nickname = posMember.nickname || member.nickname;
    }

    if (posMember.phone && posMember.phone !== member.phone) {
      const existing = await this.memberRepo.findOne({ where: { phone: posMember.phone } });
      if (!existing || existing.id === member.id) {
      patch.phone = posMember.phone;
      }
    }

    if (posMember.pos_vip_no && posMember.pos_vip_no !== member.member_no) {
      const existing = await this.memberRepo.findOne({ where: { member_no: posMember.pos_vip_no } });
      if (!existing || existing.id === member.id) {
        patch.member_no = posMember.pos_vip_no;
      }
    }

    await this.memberRepo.update(member.id, patch);
    return this.memberRepo.findOneOrFail({ where: { id: member.id } });
  }

  private withFreshness(member: Member, freshness: 'realtime' | 'cached'): MemberWithFreshness {
    return {
      ...member,
      data_freshness: freshness,
      last_synced_at: member.pos_last_synced_at || null,
    };
  }
}
