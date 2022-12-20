import { IProduct } from './../mongo-models/product.model';
import { ProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaginationDto } from 'oteos-backend-lib';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'

@Controller('api/v1/products')
@ApiTags('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products',
  })
  fetchProducts(
    @Query() query: any
  ): Promise<PaginationDto> {
    return this.productsService.fetchProducts(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
  })
  createproduct(@Body(ValidationPipe) product: ProductDto): Promise<IProduct> {
    return this.productsService.createproduct(product);
  }

  @Put('/:code')
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
  @ApiOperation({
    summary: 'Delete a product',
  })
  deleteProduct(@Param('code') code: string): Promise<boolean> {
    return this.productsService.deleteProduct(code);
  }

  @Post('setImage/:code')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Set image to product',
  })
  setImageToProduct(@Param('code') code: string, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.setImageToProduct(code, file);
  }
}
  