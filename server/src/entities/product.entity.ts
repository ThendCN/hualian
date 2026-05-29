import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  merchant_id: number;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  original_price: number;

  @Column({ type: 'simple-json', default: '[]' })
  images: string[];

  @Column({ nullable: true })
  category_id: number;

  @Column({ default: false })
  is_hot: boolean;

  @Column({ default: false })
  is_new: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @CreateDateColumn()
  created_at: Date;
}
