import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CouponType {
  DISCOUNT = 'discount',
  CASH = 'cash',
  FREE_PARKING = 'free_parking',
}

export enum CouponTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('coupon_templates')
export class CouponTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: CouponType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_amount: number;

  @Column()
  total_count: number;

  @Column({ default: 0 })
  issued_count: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ nullable: true })
  activity_id: number;

  @Column({ type: 'varchar', default: CouponTemplateStatus.ACTIVE })
  status: CouponTemplateStatus;

  @CreateDateColumn()
  created_at: Date;
}
