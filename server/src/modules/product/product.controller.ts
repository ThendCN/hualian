import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';

@ApiTags('商品')
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('categories')
  @ApiOperation({ summary: '商品分类列表（树形）' })
  getCategories() {
    return this.productService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: '商品列表' })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'merchant_id', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'is_hot', required: false })
  @ApiQuery({ name: 'is_new', required: false })
  getProducts(
    @Query('category_id') category_id?: number,
    @Query('merchant_id') merchant_id?: number,
    @Query('keyword') keyword?: string,
    @Query('is_hot') is_hot?: string,
    @Query('is_new') is_new?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.productService.getProducts({
      category_id: category_id ? +category_id : undefined,
      merchant_id: merchant_id ? +merchant_id : undefined,
      keyword,
      is_hot: is_hot !== undefined ? is_hot === 'true' : undefined,
      is_new: is_new !== undefined ? is_new === 'true' : undefined,
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '商品详情' })
  getProduct(@Param('id') id: string) {
    return this.productService.getProduct(+id);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '收藏/取消收藏商品' })
  toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.productService.toggleFavorite(req.user.id, +id);
  }
}

@ApiTags('商户')
@Controller('merchants')
export class MerchantController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '商户列表' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'floor', required: false })
  getMerchants(@Query('category') category?: string, @Query('floor') floor?: string) {
    return this.productService.getMerchants({ category, floor });
  }

  @Get(':id')
  @ApiOperation({ summary: '商户详情（含商品列表）' })
  getMerchant(@Param('id') id: string) {
    return this.productService.getMerchant(+id);
  }
}

@ApiTags('我的收藏')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('member/favorites')
export class FavoriteController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '我的收藏列表' })
  getFavorites(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.productService.getFavorites(req.user.id, +page, +limit);
  }
}
