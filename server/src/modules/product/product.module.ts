import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { Merchant } from '../../entities/merchant.entity';
import { MemberFavorite } from '../../entities/member-favorite.entity';
import { ProductController, MerchantController, FavoriteController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, Merchant, MemberFavorite])],
  controllers: [ProductController, MerchantController, FavoriteController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
