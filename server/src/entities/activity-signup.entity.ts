import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Member } from './member.entity';
import { Activity } from './activity.entity';

@Entity('activity_signups')
@Unique(['member_id', 'activity_id'])
export class ActivitySignup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  activity_id: number;

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @CreateDateColumn()
  created_at: Date;
}
