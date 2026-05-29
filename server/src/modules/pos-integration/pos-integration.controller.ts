import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PosAdminTokenGuard } from './pos-admin-token.guard';
import { PosMemberGateway } from './pos-member.gateway';

@ApiTags('POS 集成')
@Controller('pos-integration')
@UseGuards(PosAdminTokenGuard)
export class PosIntegrationController {
  constructor(private posMemberGateway: PosMemberGateway) {}

  @Get('members/preview')
  @ApiOperation({ summary: '预览 POS 会员数据' })
  @ApiQuery({ name: 'keyword', required: false, description: '手机号/卡号/会员名关键字' })
  previewMembers(@Query('keyword') keyword = '', @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.posMemberGateway.getMembers({ keyword, page: Number(page), pageSize: Number(pageSize) });
  }

  @Post('members/lookup')
  @ApiOperation({ summary: '实时查询单个 POS 会员' })
  lookupMember(@Query('keyword') keyword: string) {
    return this.posMemberGateway.findMember({ phone: keyword, memberNo: keyword, posMemberId: keyword });
  }
}
