import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ParkingService } from './parking.service';

@ApiTags('停车')
@Controller('parking')
export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  @Get('query')
  @ApiOperation({ summary: '查询停车记录（按车牌）' })
  queryParking(@Query('plate_number') plateNumber: string) {
    return this.parkingService.queryParking(plateNumber);
  }

  @Get('records')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '我的停车记录' })
  getParkingRecords(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.parkingService.getParkingRecords(req.user.id, +page, +limit);
  }

  @Post('deduct')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '积分抵扣停车费' })
  deductParking(@Request() req, @Body() body: { parking_order_id: string; points: number }) {
    return this.parkingService.deductParking(req.user.id, body.parking_order_id, body.points);
  }
}
