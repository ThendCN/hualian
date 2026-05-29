import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';

@ApiTags('活动')
@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '活动列表' })
  @ApiQuery({ name: 'filter', required: false, enum: ['all', 'active', 'upcoming'] })
  getActivities(
    @Query('filter') filter: 'all' | 'active' | 'upcoming' = 'all',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.activityService.getActivities(filter, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '活动详情' })
  getActivity(@Param('id') id: string) {
    return this.activityService.getActivity(+id);
  }

  @Post(':id/signup')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '活动报名' })
  signup(@Request() req, @Param('id') id: string) {
    return this.activityService.signup(req.user.id, +id);
  }
}

@ApiTags('优惠券')
@Controller('coupons')
export class CouponController {
  constructor(private activityService: ActivityService) {}

  @Get('available')
  @ApiOperation({ summary: '可领取的优惠券列表' })
  getAvailable() {
    return this.activityService.getAvailableCoupons();
  }

  @Post(':id/claim')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '领取优惠券' })
  claim(@Request() req, @Param('id') id: string) {
    return this.activityService.claimCoupon(req.user.id, +id);
  }
}

@ApiTags('我的优惠券')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('member/coupons')
export class MemberCouponController {
  constructor(private activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: '我的优惠券' })
  @ApiQuery({ name: 'status', required: false, enum: ['unused', 'used', 'expired'] })
  getMemberCoupons(@Request() req, @Query('status') status?: string) {
    return this.activityService.getMemberCoupons(req.user.id, status);
  }
}

@ApiTags('公告')
@Controller('announcements')
export class AnnouncementController {
  constructor(private activityService: ActivityService) {}

  @Get('latest')
  @ApiOperation({ summary: '最新置顶公告' })
  getLatest() {
    return this.activityService.getLatestAnnouncement();
  }

  @Get()
  @ApiOperation({ summary: '公告列表' })
  getAnnouncements(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.activityService.getAnnouncements(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '公告详情' })
  getAnnouncement(@Param('id') id: string) {
    return this.activityService.getAnnouncement(+id);
  }
}
