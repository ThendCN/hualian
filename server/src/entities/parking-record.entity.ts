import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';

export enum ParkingStatus {
  PENDING = 'pending',
  DEDUCTED = 'deducted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('parking_records')
export class ParkingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  plate_number: string;

  @Column()
  parking_order_id: string;

  @Column()
  entry_time: Date;

  @Column({ nullable: true })
  exit_time: Date;

  @Column({ nullable: true })
  duration_minutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_fee: number;

  @Column({ default: 0 })
  points_deducted: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_deducted: number;

  @Column({ default: false })
  free_by_consumption: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actual_paid: number;

  @Column({ type: 'varchar', default: ParkingStatus.PENDING })
  status: ParkingStatus;

  @CreateDateColumn()
  created_at: Date;
}
