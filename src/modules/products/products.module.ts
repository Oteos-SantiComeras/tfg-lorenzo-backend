import { CategoriesModule } from './../categories/categories.module';
import { IProduct, productSchema } from './mongo-model/product.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { MongoDbService } from "oteos-backend-lib";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        CategoriesModule,
      ],
      controllers: [
        ProductsController
      ],
      providers: [
        ProductsService,
        {
          provide: 'MODEL',
          useFactory: (db: MongoDbService) => db.getConnection().model<IProduct>('Product', productSchema, 'products'),
          inject: [MongoDbService]
        }
      ],
      exports: [
        ProductsService
      ]
})
export class ProductsModule { }
