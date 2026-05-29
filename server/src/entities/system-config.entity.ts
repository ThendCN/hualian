import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export enum ConfigCategory {
  POINTS = 'points',
  PARKING = 'parking',
  MEMBER = 'member',
  GENERAL = 'general',
}

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  config_key: string;

  @Column()
  config_value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  category: ConfigCategory;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;
}
