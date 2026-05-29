import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum MemberLevel {
  NORMAL = 'normal',
  SILVER = 'silver',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export enum MemberSource {
  MINIAPP = 'miniapp',
  POS_SYNC = 'pos_sync',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  member_no: string;

  @Column({ type: 'varchar', default: MemberLevel.NORMAL })
  level: MemberLevel;

  @Column({ default: 0 })
  total_points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_consumed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  year_consumed: number;

  @Column({ type: 'varchar', default: MemberSource.MINIAPP })
  source: MemberSource;

  @Column({ type: 'varchar', nullable: true })
  pos_member_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  pos_vip_no: string | null;

  @Column({ type: 'datetime', nullable: true })
  pos_last_synced_at: Date | null;

  @Column({ type: 'text', nullable: true })
  pos_last_sync_error: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
