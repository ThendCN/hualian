import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Member } from './entities/member.entity';
import { MemberVehicle } from './entities/member-vehicle.entity';
import { PointsLog } from './entities/points-log.entity';
import { ConsumptionRecord } from './entities/consumption-record.entity';
import { ParkingRecord } from './entities/parking-record.entity';
import { Merchant } from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { Activity } from './entities/activity.entity';
import { Announcement } from './entities/announcement.entity';
import { CouponTemplate } from './entities/coupon-template.entity';
import { MemberCoupon } from './entities/member-coupon.entity';
import { SystemConfig } from './entities/system-config.entity';
import { MemberFavorite } from './entities/member-favorite.entity';
import { ActivitySignup } from './entities/activity-signup.entity';
import { AuthModule } from './modules/auth/auth.module';
import { MemberModule } from './modules/member/member.module';
import { ProductModule } from './modules/product/product.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PointsModule } from './modules/points/points.module';
import { ParkingModule } from './modules/parking/parking.module';
import { AppConfigModule } from './modules/config/config.module';
import { PosIntegrationModule } from './modules/pos-integration/pos-integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './data/hualian.db',
      entities: [
        Member, MemberVehicle, PointsLog, ConsumptionRecord, ParkingRecord,
        Merchant, Product, ProductCategory, Activity, Announcement,
        CouponTemplate, MemberCoupon, SystemConfig, MemberFavorite, ActivitySignup,
      ],
      synchronize: true,
    }),
    AuthModule,
    MemberModule,
    ProductModule,
    ActivityModule,
    PointsModule,
    ParkingModule,
    AppConfigModule,
    PosIntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
