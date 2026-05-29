import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AnnouncementType {
  NOTICE = 'notice',
  NEW_STORE = 'new_store',
  PARKING = 'parking',
  GENERAL = 'general',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  type: AnnouncementType;

  @Column({ default: false })
  is_top: boolean;

  @Column({ type: 'varchar', default: AnnouncementStatus.DRAFT })
  status: AnnouncementStatus;

  @Column({ nullable: true })
  publish_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
