import { CategoryDto } from './../../categories/dto/category.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  category: CategoryDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  tax: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  publicSellPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}