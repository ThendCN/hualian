import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../entities/member.entity';
import { MemberVehicle } from '../../entities/member-vehicle.entity';
import { PointsLog } from '../../entities/points-log.entity';
import { ConsumptionRecord } from '../../entities/consumption-record.entity';
import { MemberCoupon } from '../../entities/member-coupon.entity';
import { MemberController, VehicleController } from './member.controller';
import { ConsumptionController } from './consumption.controller';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberVehicle, PointsLog, ConsumptionRecord, MemberCoupon])],
  controllers: [MemberController, VehicleController, ConsumptionController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
