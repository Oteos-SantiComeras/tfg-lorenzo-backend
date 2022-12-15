import { ProductDto } from './../../products/dto/product.dto';
import { UserDto } from 'oteos-backend-lib';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CartDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  _id?: string;

  @ApiProperty()
  @IsNotEmpty()
  user: UserDto;

  @ApiProperty()
  @IsOptional()
  products?: ProductDto[];

  @ApiProperty()
  @IsOptional()
  amounts?: number[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalItems?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalPriceTaxs?: number;
}