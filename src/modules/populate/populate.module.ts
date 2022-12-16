import { ProductsModule } from './../products/products.module';
import { CategoriesModule } from './../categories/categories.module';
import { UsersModule, RolesModule, PermissionsModule } from 'oteos-backend-lib';
import { Module } from '@nestjs/common';
import { PopulateService } from './populate.service';

@Module({
  imports:[
    PermissionsModule,
    RolesModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [PopulateService]
})
export class PopulateModule {}
