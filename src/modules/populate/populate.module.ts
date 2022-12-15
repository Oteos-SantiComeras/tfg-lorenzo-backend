import { CartModule } from './../cart/cart.module';
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
    CartModule,
  ],
  controllers: [],
  providers: [PopulateService]
})
export class PopulateModule {}
