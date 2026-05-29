import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @ApiProperty({ example: '13800138001', description: '手机号' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '1234', description: '验证码（开发阶段固定 1234）', required: false })
  @IsOptional()
  @IsString()
  code?: string;
}

@ApiTags('认证')
@Controller('member')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '手机号登录/注册（验证码固定 1234）' })
  async login(@Body() dto: LoginDto) {
    if (dto.code !== undefined && dto.code !== '1234') {
      throw new BadRequestException('验证码错误');
    }
    return this.authService.loginOrRegister(dto.phone);
  }
}
