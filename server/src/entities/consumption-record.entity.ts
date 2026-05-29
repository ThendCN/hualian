import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';

@Entity('consumption_records')
export class ConsumptionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  pos_order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  store_name: string;

  @Column({ default: 0 })
  points_earned: number;

  @CreateDateColumn()
  synced_at: Date;

  @Column()
  consumed_at: Date;
}
