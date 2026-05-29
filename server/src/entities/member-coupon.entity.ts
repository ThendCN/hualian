import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';
import { CouponTemplate } from './coupon-template.entity';

export enum MemberCouponStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('member_coupons')
export class MemberCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  template_id: number;

  @ManyToOne(() => CouponTemplate)
  @JoinColumn({ name: 'template_id' })
  template: CouponTemplate;

  @Column({ type: 'varchar', default: MemberCouponStatus.UNUSED })
  status: MemberCouponStatus;

  @Column({ nullable: true })
  used_at: Date;

  @Column()
  expire_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
