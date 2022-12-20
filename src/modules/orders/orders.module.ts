import { CartModule } from './../cart/cart.module';
import { IOrder, orderSchema } from './mongo-model/order.model';
import { OrdersService } from './orders.service';
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { MongoDbService } from "oteos-backend-lib";
import { OrdersController } from "./orders.controller";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        CartModule,
    ],
    controllers: [
        OrdersController
    ],
    providers: [
        OrdersService,
        {
            provide: 'MODEL',
            useFactory: (db: MongoDbService) => db.getConnection().model<IOrder>('Order', orderSchema, 'orders'),
            inject: [MongoDbService]
        }
    ],
    exports: [
        OrdersService
    ]
})
export class OrdersModule { }
