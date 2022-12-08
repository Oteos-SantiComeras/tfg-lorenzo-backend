import { ICategory } from './../mongo-models/category.model';
import { CategoryDto } from './dto/category.dto';
import { CategoriesService } from './categories.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'oteos-backend-lib';

@Controller('api/v1/categories')
@ApiTags('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all categories',
  })
  fetchCategories(
    @Query() query: any
  ): Promise<PaginationDto> {
    return this.categoriesService.fetchCategories(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new category',
  })
  createCategory(@Body(ValidationPipe) category: CategoryDto): Promise<ICategory> {
    return this.categoriesService.createCategory(category);
  }

  @Put('/:name')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a category',
  })
  updateCategory(
    @Param('name') name: string,
    @Body(ValidationPipe) category: CategoryDto,
  ): Promise<ICategory> {
    return this.categoriesService.updateCategory(name, category);
  }

  @Delete('/:name')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a category',
  })
  deleteCategory(@Param('name') name: string): Promise<boolean> {
    return this.categoriesService.deleteCategory(name);
  }
}
  