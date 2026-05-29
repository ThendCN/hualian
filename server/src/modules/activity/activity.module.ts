import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../../entities/activity.entity';
import { Announcement } from '../../entities/announcement.entity';
import { CouponTemplate } from '../../entities/coupon-template.entity';
import { MemberCoupon } from '../../entities/member-coupon.entity';
import { ActivitySignup } from '../../entities/activity-signup.entity';
import { ActivityController, CouponController, MemberCouponController, AnnouncementController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Announcement, CouponTemplate, MemberCoupon, ActivitySignup])],
  controllers: [ActivityController, CouponController, MemberCouponController, AnnouncementController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
