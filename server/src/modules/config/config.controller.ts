import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from './config.service';

@ApiTags('系统配置')
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取所有配置（管理用）' })
  getAll() {
    return this.configService.getAll();
  }

  @Get('public')
  @ApiOperation({ summary: '获取公开配置（积分比例、停车规则、等级门槛）' })
  async getPublic() {
    const all = await this.configService.getAll();
    // 只返回前端需要的配置，排除敏感项
    const publicKeys = [
      'points.earn_ratio', 'points.exchange_ratio', 'points.checkin_daily', 'points.checkin_streak_7', 'points.referral',
      'parking.free_threshold', 'parking.free_max_hours', 'parking.silver_free_hours', 'parking.gold_free_hours', 'parking.diamond_free_hours',
      'member.silver_threshold', 'member.gold_threshold', 'member.diamond_threshold',
    ];
    const result: Record<string, string> = {};
    for (const item of all) {
      if (publicKeys.includes(item.config_key)) {
        result[item.config_key] = item.config_value;
      }
    }
    return result;
  }
}
