import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';

export enum PointsLogType {
  EARN = 'earn',
  CONSUME = 'consume',
  EXPIRE = 'expire',
  ADJUST = 'adjust',
}

export enum PointsLogSource {
  CONSUMPTION = 'consumption',
  CHECKIN = 'checkin',
  REFERRAL = 'referral',
  ACTIVITY = 'activity',
  PARKING = 'parking',
  EXCHANGE = 'exchange',
}

@Entity('points_logs')
export class PointsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'varchar' })
  type: PointsLogType;

  @Column({ type: 'varchar' })
  source: PointsLogSource;

  @Column()
  points: number;

  @Column()
  balance_after: number;

  @Column({ nullable: true })
  ref_id: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
