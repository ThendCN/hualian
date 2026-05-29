import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Activity, ActivityStatus } from '../../entities/activity.entity';
import { Announcement, AnnouncementStatus } from '../../entities/announcement.entity';
import { CouponTemplate, CouponTemplateStatus } from '../../entities/coupon-template.entity';
import { MemberCoupon, MemberCouponStatus } from '../../entities/member-coupon.entity';
import { ActivitySignup } from '../../entities/activity-signup.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Announcement)
    private announcementRepo: Repository<Announcement>,
    @InjectRepository(CouponTemplate)
    private couponTemplateRepo: Repository<CouponTemplate>,
    @InjectRepository(MemberCoupon)
    private memberCouponRepo: Repository<MemberCoupon>,
    @InjectRepository(ActivitySignup)
    private signupRepo: Repository<ActivitySignup>,
  ) {}

  async getActivities(filter: 'all' | 'active' | 'upcoming' = 'all', page = 1, limit = 10) {
    const qb = this.activityRepo.createQueryBuilder('a');
    const now = new Date();

    if (filter === 'active') {
      qb.where('a.status = :status', { status: ActivityStatus.ACTIVE });
    } else if (filter === 'upcoming') {
      qb.where('a.start_time > :now', { now }).andWhere('a.status != :ended', { ended: ActivityStatus.ENDED });
    } else {
      qb.where('a.status != :draft', { draft: ActivityStatus.DRAFT });
    }

    qb.orderBy('a.start_time', 'DESC').skip((page - 1) * limit).take(limit);
    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, limit };
  }

  async getActivity(id: number) {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException('活动不存在');
    return activity;
  }

  async signup(memberId: number, activityId: number) {
    const activity = await this.activityRepo.findOne({ where: { id: activityId } });
    if (!activity) throw new NotFoundException('活动不存在');
    if (!activity.require_signup) throw new BadRequestException('该活动无需报名');
    if (activity.status === ActivityStatus.ENDED) throw new BadRequestException('活动已结束');

    const existing = await this.signupRepo.findOne({ where: { member_id: memberId, activity_id: activityId } });
    if (existing) throw new BadRequestException('已报名该活动');

    const record = this.signupRepo.create({ member_id: memberId, activity_id: activityId });
    return this.signupRepo.save(record);
  }

  async getAnnouncements(page = 1, limit = 10) {
    const [list, total] = await this.announcementRepo.findAndCount({
      where: { status: AnnouncementStatus.PUBLISHED },
      order: { is_top: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list, total, page, limit };
  }

  async getAnnouncement(id: number) {
    const item = await this.announcementRepo.findOne({ where: { id, status: AnnouncementStatus.PUBLISHED } });
    if (!item) throw new NotFoundException('公告不存在');
    return item;
  }

  async getLatestAnnouncement() {
    return this.announcementRepo.findOne({
      where: { status: AnnouncementStatus.PUBLISHED, is_top: true },
      order: { created_at: 'DESC' },
    });
  }

  async getAvailableCoupons() {
    const now = new Date();
    return this.couponTemplateRepo.createQueryBuilder('t')
      .where('t.status = :status', { status: CouponTemplateStatus.ACTIVE })
      .andWhere('t.start_time <= :now', { now })
      .andWhere('t.end_time >= :now', { now })
      .andWhere('t.issued_count < t.total_count')
      .orderBy('t.created_at', 'DESC')
      .getMany();
  }

  async claimCoupon(memberId: number, templateId: number) {
    const template = await this.couponTemplateRepo.findOne({ where: { id: templateId } });
    if (!template || template.status !== CouponTemplateStatus.ACTIVE) {
      throw new BadRequestException('优惠券不存在或已下架');
    }
    if (template.issued_count >= template.total_count) {
      throw new BadRequestException('优惠券已领完');
    }
    const now = new Date();
    if (now < template.start_time || now > template.end_time) {
      throw new BadRequestException('不在领取时间范围内');
    }

    const existing = await this.memberCouponRepo.findOne({
      where: { member_id: memberId, template_id: templateId, status: MemberCouponStatus.UNUSED },
    });
    if (existing) throw new BadRequestException('已领取过该优惠券');

    await this.couponTemplateRepo.increment({ id: templateId }, 'issued_count', 1);
    const coupon = this.memberCouponRepo.create({
      member_id: memberId,
      template_id: templateId,
      status: MemberCouponStatus.UNUSED,
      expire_at: template.end_time,
    });
    return this.memberCouponRepo.save(coupon);
  }

  async getMemberCoupons(memberId: number, status?: string) {
    const where: any = { member_id: memberId };
    if (status) where.status = status;
    return this.memberCouponRepo.find({
      where,
      relations: ['template'],
      order: { created_at: 'DESC' },
    });
  }
}
