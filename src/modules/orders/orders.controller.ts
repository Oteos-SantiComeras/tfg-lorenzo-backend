import { IOrder } from './../mongo-models/order.model';
import { OrderDto } from './dto/order.dto';
import { ICart } from '../mongo-models/cart.model';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from 'oteos-backend-lib';
import { OrdersService } from './orders.service';

@Controller('api/v1/orders')
@ApiTags('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all orders',
  })
  fetchOrders(
    @Query() query: any
  ): Promise<PaginationDto> {
    return this.ordersService.fetchOrders(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new order',
  })
  createOrder(@Body(ValidationPipe) order: OrderDto): Promise<IOrder> {
    return this.ordersService.createOrder(order);
  }

  @Put('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a order',
  })
  updateOrder(
    @Param('_id') _id: string,
    @Body(ValidationPipe) newOrder: OrderDto,
  ): Promise<IOrder> {
    return this.ordersService.updateOrder(_id, newOrder);
  }

  @Delete('/:_id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a order',
  })
  deleteOrder(@Param('_id') _id: string): Promise<boolean> {
    return this.ordersService.deleteOrder(_id);
  }
}
  