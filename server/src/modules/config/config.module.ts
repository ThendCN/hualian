import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '../../entities/system-config.entity';
import { Member } from '../../entities/member.entity';
import { MemberVehicle } from '../../entities/member-vehicle.entity';
import { Merchant } from '../../entities/merchant.entity';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { Activity } from '../../entities/activity.entity';
import { Announcement } from '../../entities/announcement.entity';
import { CouponTemplate } from '../../entities/coupon-template.entity';
import { PointsLog } from '../../entities/points-log.entity';
import { ConsumptionRecord } from '../../entities/consumption-record.entity';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig, Member, MemberVehicle, Merchant, Product, ProductCategory,
      Activity, Announcement, CouponTemplate, PointsLog, ConsumptionRecord,
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigService, SeedService],
  exports: [ConfigService],
})
export class AppConfigModule {}
