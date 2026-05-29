import { Controller, Get, Put, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberService } from './member.service';

class UpdateProfileDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nickname?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() avatar?: string;
}

class AddVehicleDto {
  @ApiProperty({ example: '粤B12345' }) @IsString() plate_number: string;
  @ApiProperty({ required: false, example: '蓝' }) @IsOptional() @IsString() plate_color?: string;
}

@ApiTags('会员')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取会员信息' })
  getProfile(@Request() req) {
    return this.memberService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新会员信息（nickname/avatar）' })
  updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    return this.memberService.updateProfile(req.user.id, body);
  }

  @Get('qrcode')
  @ApiOperation({ summary: '获取会员码数据' })
  getQrcode(@Request() req) {
    return this.memberService.getQrcode(req.user.id);
  }
}

@ApiTags('车辆管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('vehicles')
export class VehicleController {
  constructor(private memberService: MemberService) {}

  @Get()
  @ApiOperation({ summary: '车辆列表' })
  getVehicles(@Request() req) {
    return this.memberService.getVehicles(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '添加车辆' })
  addVehicle(@Request() req, @Body() body: AddVehicleDto) {
    return this.memberService.addVehicle(req.user.id, body.plate_number, body.plate_color);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除车辆' })
  deleteVehicle(@Request() req, @Param('id') id: string) {
    return this.memberService.deleteVehicle(req.user.id, +id);
  }

  @Put(':id/default')
  @ApiOperation({ summary: '设为默认车辆' })
  setDefault(@Request() req, @Param('id') id: string) {
    return this.memberService.setDefaultVehicle(req.user.id, +id);
  }
}
