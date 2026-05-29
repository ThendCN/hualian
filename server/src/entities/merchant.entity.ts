import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  floor: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  business_hours: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  category: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', default: MerchantStatus.ACTIVE })
  status: MerchantStatus;

  @CreateDateColumn()
  created_at: Date;
}
