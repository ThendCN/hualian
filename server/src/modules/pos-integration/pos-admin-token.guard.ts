import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PosAdminTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('BYPOS_ADMIN_TOKEN');
    if (!expected) {
      throw new ForbiddenException('POS 管理接口未启用');
    }

    const request = context.switchToHttp().getRequest();
    const actual = request.headers['x-pos-admin-token'];
    if (actual !== expected) {
      throw new ForbiddenException('POS 管理令牌无效');
    }

    return true;
  }
}
