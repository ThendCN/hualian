import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';

@ApiTags('积分')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get('log')
  @ApiOperation({ summary: '积分明细列表' })
  @ApiQuery({ name: 'type', required: false, enum: ['earn', 'consume', 'expire', 'adjust'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  getLogs(@Request() req, @Query('type') type?: string, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.pointsService.getLogs(req.user.id, type, +page, +pageSize);
  }

  @Get('checkin/status')
  @ApiOperation({ summary: '签到状态（今日是否签到、连续天数）' })
  getCheckinStatus(@Request() req) {
    return this.pointsService.getCheckinStatus(req.user.id);
  }

  @Post('checkin')
  @ApiOperation({ summary: '每日签到' })
  checkin(@Request() req) {
    return this.pointsService.checkin(req.user.id);
  }
}
