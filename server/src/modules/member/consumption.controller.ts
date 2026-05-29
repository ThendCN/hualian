import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from '../member/member.service';

@ApiTags('消费记录')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('consumption')
export class ConsumptionController {
  constructor(private memberService: MemberService) {}

  @Get()
  @ApiOperation({ summary: '消费记录列表（分页，按 consumed_at 倒序）' })
  getRecords(@Request() req, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.memberService.getConsumptionRecords(req.user.id, +page, +pageSize);
  }
}
