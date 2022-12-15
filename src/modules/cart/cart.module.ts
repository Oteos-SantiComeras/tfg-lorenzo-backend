import { cartSchema, ICart } from './../mongo-models/cart.model';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from './../products/products.module';
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { MongoDbService, PaginationModule, SlackModule, UsersModule } from "oteos-backend-lib";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        PaginationModule,
        SlackModule,
        ProductsModule,
        UsersModule,
    ],
    controllers: [
        CartController
    ],
    providers: [
        CartService,
        {
            provide: 'MODEL',
            useFactory: (db: MongoDbService) => db.getConnection().model<ICart>('Cart', cartSchema, 'carts'),
            inject: [MongoDbService]
        }
    ],
    exports: [
        CartService
    ]
})
export class CartModule { }
