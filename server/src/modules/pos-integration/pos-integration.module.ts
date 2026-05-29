import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../entities/member.entity';
import { ByPosClientService } from './bypos-client.service';
import { PosAdminTokenGuard } from './pos-admin-token.guard';
import { PosIntegrationController } from './pos-integration.controller';
import { PosMemberCacheService } from './pos-member-cache.service';
import { PosMemberGateway } from './pos-member.gateway';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [PosIntegrationController],
  providers: [ByPosClientService, PosMemberGateway, PosMemberCacheService, PosAdminTokenGuard],
  exports: [ByPosClientService, PosMemberGateway, PosMemberCacheService],
})
export class PosIntegrationModule {}
