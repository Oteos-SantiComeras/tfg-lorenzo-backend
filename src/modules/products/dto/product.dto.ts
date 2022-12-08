import { CategoryDto } from './../../categories/dto/category.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class ProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(15)
  @MaxLength(15)
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;
}