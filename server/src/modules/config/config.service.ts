import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../entities/system-config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
  ) {}

  async getAll() {
    return this.configRepo.find();
  }

  async get(key: string): Promise<string | null> {
    const config = await this.configRepo.findOne({ where: { config_key: key } });
    return config?.config_value ?? null;
  }

  async set(key: string, value: string) {
    await this.configRepo.upsert({ config_key: key, config_value: value }, ['config_key']);
    return this.configRepo.findOne({ where: { config_key: key } });
  }
}
