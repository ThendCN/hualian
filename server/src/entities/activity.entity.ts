import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ActivityType {
  PROMOTION = 'promotion',
  MEMBER_DAY = 'member_day',
  FESTIVAL = 'festival',
  LOTTERY = 'lottery',
}

export enum ActivityStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  type: ActivityType;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ type: 'varchar', default: ActivityStatus.DRAFT })
  status: ActivityStatus;

  @Column({ default: false })
  require_signup: boolean;

  @CreateDateColumn()
  created_at: Date;
}
