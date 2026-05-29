import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { Merchant, MerchantStatus } from '../../entities/merchant.entity';
import { MemberFavorite } from '../../entities/member-favorite.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(MemberFavorite)
    private favoriteRepo: Repository<MemberFavorite>,
  ) {}

  async getCategories() {
    const all = await this.categoryRepo.find({ order: { sort_order: 'ASC' } });
    // 构建树形结构
    const roots = all.filter(c => !c.parent_id);
    const children = all.filter(c => !!c.parent_id);
    return roots.map(r => ({ ...r, children: children.filter(c => c.parent_id === r.id) }));
  }

  async getProducts(query: {
    category_id?: number; merchant_id?: number; keyword?: string;
    is_hot?: boolean; is_new?: boolean; page?: number; limit?: number;
  }) {
    const { category_id, merchant_id, keyword, is_hot, is_new, page = 1, limit = 20 } = query;
    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.merchant', 'merchant')
      .where('p.status = :status', { status: ProductStatus.ACTIVE });

    if (category_id) qb.andWhere('p.category_id = :category_id', { category_id });
    if (merchant_id) qb.andWhere('p.merchant_id = :merchant_id', { merchant_id });
    if (keyword) qb.andWhere('p.name LIKE :kw', { kw: `%${keyword}%` });
    if (is_hot !== undefined) qb.andWhere('p.is_hot = :is_hot', { is_hot });
    if (is_new !== undefined) qb.andWhere('p.is_new = :is_new', { is_new });

    qb.orderBy('p.sort_order', 'ASC').addOrderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit).take(limit);

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, limit };
  }

  async getProduct(id: number) {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['merchant'] });
    if (!product) throw new NotFoundException('商品不存在');
    return product;
  }

  async toggleFavorite(memberId: number, productId: number) {
    const existing = await this.favoriteRepo.findOne({ where: { member_id: memberId, product_id: productId } });
    if (existing) {
      await this.favoriteRepo.delete(existing.id);
      return { favorited: false };
    }
    await this.favoriteRepo.save(this.favoriteRepo.create({ member_id: memberId, product_id: productId }));
    return { favorited: true };
  }

  async getFavorites(memberId: number, page = 1, limit = 20) {
    const [list, total] = await this.favoriteRepo.findAndCount({
      where: { member_id: memberId },
      relations: ['product', 'product.merchant'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: list.map(f => f.product), total, page, limit };
  }

  async getMerchants(query: { category?: string; floor?: string }) {
    const qb = this.merchantRepo.createQueryBuilder('m')
      .where('m.status = :status', { status: MerchantStatus.ACTIVE });
    if (query.category) qb.andWhere('m.category = :category', { category: query.category });
    if (query.floor) qb.andWhere('m.floor = :floor', { floor: query.floor });
    qb.orderBy('m.sort_order', 'ASC');
    return qb.getMany();
  }

  async getMerchant(id: number) {
    const merchant = await this.merchantRepo.findOne({ where: { id } });
    if (!merchant) throw new NotFoundException('商户不存在');
    const products = await this.productRepo.find({
      where: { merchant_id: id, status: ProductStatus.ACTIVE },
      order: { sort_order: 'ASC' },
      take: 20,
    });
    return { ...merchant, products };
  }
}
