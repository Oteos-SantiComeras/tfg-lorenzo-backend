import { IProduct } from './../mongo-models/product.model';
import { ProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from 'oteos-backend-lib';

@Controller('api/v1/products')
@ApiTags('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all products',
  })
  fetchProducts(
    @Query() query: any
  ): Promise<PaginationDto> {
    return this.productsService.fetchProducts(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new product',
  })
  createproduct(@Body(ValidationPipe) product: ProductDto): Promise<IProduct> {
    return this.productsService.createproduct(product);
  }

  @Put('/:code')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a product',
  })
  updateProduct(
    @Param('code') code: string,
    @Body(ValidationPipe) newProduct: ProductDto,
  ): Promise<IProduct> {
    return this.productsService.updateProduct(code, newProduct);
  }

  @Delete('/:code')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a product',
  })
  deleteProduct(@Param('code') code: string): Promise<boolean> {
    return this.productsService.deleteProduct(code);
  }
}
  