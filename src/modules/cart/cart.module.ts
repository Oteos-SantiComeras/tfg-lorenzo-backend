import { cartSchema, ICart } from './../mongo-models/cart.model';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { MongoDbService, UsersModule } from "oteos-backend-lib";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
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
