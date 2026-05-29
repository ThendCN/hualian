import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingRecord, ParkingStatus } from '../../entities/parking-record.entity';
import { PointsService } from '../points/points.service';
import { PointsLogSource } from '../../entities/points-log.entity';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingRecord)
    private parkingRepo: Repository<ParkingRecord>,
    private pointsService: PointsService,
  ) {}

  async queryParking(plateNumber: string) {
    return this.parkingRepo.find({
      where: { plate_number: plateNumber, status: ParkingStatus.PENDING },
      order: { entry_time: 'DESC' },
    });
  }

  async getParkingRecords(memberId: number, page = 1, limit = 20) {
    const [list, total] = await this.parkingRepo.findAndCount({
      where: { member_id: memberId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list, total, page, limit };
  }

  async deductParking(memberId: number, parkingOrderId: string, pointsToDeduct: number) {
    const record = await this.parkingRepo.findOne({ where: { parking_order_id: parkingOrderId } });
    if (!record) throw new Error('停车记录不存在');

    const amountDeducted = pointsToDeduct / 100;
    await this.pointsService.consumePoints(
      memberId,
      pointsToDeduct,
      PointsLogSource.PARKING,
      `停车费抵扣 ${amountDeducted} 元`,
      parkingOrderId,
    );

    await this.parkingRepo.update(record.id, {
      member_id: memberId,
      points_deducted: pointsToDeduct,
      amount_deducted: amountDeducted,
      status: ParkingStatus.DEDUCTED,
    });

    return this.parkingRepo.findOne({ where: { id: record.id } });
  }
}
