import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, } from 'class-validator';

export class CategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}