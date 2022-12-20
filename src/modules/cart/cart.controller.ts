import { ICart } from './mongo-model/cart.model';
import { CartDto } from './dto/cart.dto';
import { CartService } from './cart.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaginationDto } from 'oteos-backend-lib';

@Controller('api/v1/cart')
@ApiTags('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all carts',
  })
  fetchCarts(
    @Query() query: any
  ): Promise<PaginationDto> {
    return this.cartService.fetchCarts(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new cart',
  })
  createCart(@Body(ValidationPipe) cart: CartDto): Promise<ICart> {
    return this.cartService.createCart(cart);
  }

  @Put('/:_id')
  @ApiOperation({
    summary: 'Update a cart',
  })
  updateProduct(
    @Param('_id') _id: string,
    @Body(ValidationPipe) newCart: CartDto,
  ): Promise<ICart> {
    return this.cartService.updateCart(_id, newCart);
  }

  @Delete('/:_id')
  @ApiOperation({
    summary: 'Delete a cart',
  })
  deleteProduct(@Param('_id') _id: string): Promise<boolean> {
    return this.cartService.deleteCart(_id);
  }
}
  