import { CartService } from './../cart/cart.service';
import { OrderDto } from './dto/order.dto';
import { IOrder } from './../mongo-models/order.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { PaginationDto } from "oteos-backend-lib";

@Injectable()
export class OrdersService {

    constructor(
        @Inject('MODEL')
        private OrderModel: Model<IOrder>,
        private readonly cartsService: CartService,
    ) { }

    async fetchOrders(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();

        let where: any = {};
        if (query["_id"]) {
            where["_id"] = query["_id"];
        }
        if (query["name"]) {
            where["name"] = query["name"];
        }
        if (query["secondName"]) {
            where["secondName"] = query["secondName"];
        }
        if (query["email"]) {
            where["email"] = query["email"];
        }
        if (query["country"]) {
            where["country"] = query["country"];
        }
        if (query["address"]) {
            where["address"] = query["address"];
        }
        if (query["zipCode"]) {
            where["zipCode"] = query["zipCode"];
        }

        try {
            pagination.items = await this.OrderModel.find(where).populate(
                {
                    path: 'cart',
                    populate: {
                        path: 'products',
                        model: 'Product',
                    },
                }
            );
            return pagination;
        } catch (err) {
            console.error("[fetchOrders] ", err);
            throw new Error(err);
        }

        return pagination;
    }

    async createOrder(order: OrderDto): Promise<IOrder> {
        const existCart = await this.cartsService.findCart(order.cart._id);
        if(!existCart){
            console.log("[createCart] Cart " + order.cart._id + " not exist");
            throw new ConflictException('Cart ' + order.cart._id + ' not exist');
        }

        try {
            const newOrder = new this.OrderModel({
                cart: order.cart,
                paidOut: order.paidOut,
                name: order.name,
                secondName: order.secondName,
                email: order.email,
                phone: order.phone,
                country: order.country,
                address: order.address,
                zipCode: order.zipCode,
            });

            await newOrder.save();
            
            console.log("[createOrder] Create new order: ", newOrder);
            return newOrder;
        } catch (err) {
            console.log("[createOrder] ", err);
            throw new Error(err);
        }
    }

    async updateOrder(_id: string, newOrder: OrderDto): Promise<IOrder> {
        const existOrder = await this.findOrder(_id);
        if(!existOrder){
            console.log("[updateOrder] Order " + _id + " not exist");
            throw new ConflictException('Order ' + _id + ' not exist');
        }

        const existCart = await this.cartsService.findCart(newOrder.cart._id);
        if (!existCart) {
            console.log("[updateOrder] Cart " + newOrder.cart._id + " not exist");
            throw new ConflictException('Cart ' + newOrder.cart._id + ' not exist');
        }

        try {
            const updateOrder: any = {
                _id: existOrder["_id"],
                cart: existCart,
                paidOut: newOrder.paidOut,
                name: newOrder.name,
                secondName: newOrder.secondName,
                email: newOrder.email,
                phone: newOrder.phone,
                country: newOrder.country,
                address: newOrder.address,
                zipCode: newOrder.zipCode,
            }

            Object.assign(existOrder, updateOrder);
            await existCart.save();

            console.log('[updateOrder] Order ' + _id + ' updated to ' + updateOrder);
            return existOrder;
        } catch (err) {
            console.log("[updateOrder] ", err);
            throw new Error(err);
        }

        return null;
    }

    async findOrder(_id: string) {
        try {
            const order = await this.OrderModel.findOne({ _id: _id });
            return order;
        } catch (err) {
            console.error("[findOrder] ", err);  
        }

        return null;
    }

    async deleteOrder(_id: string) {    
        const order = await this.findOrder(_id);
        if (!order) {
            console.log("[deleteCart] Order " + _id + " not found");
            throw new ConflictException('Order ' + _id + ' not found');
        }

        let deleted: boolean = false;
        try {
            await order.delete();
            console.log('[deleteCart] Order ' + _id + ' deleted');
            deleted = true;
        } catch (err) {
            console.error("[deleteCart] ", err);
            throw new Error(err);
        }

        return deleted;
    }
}
