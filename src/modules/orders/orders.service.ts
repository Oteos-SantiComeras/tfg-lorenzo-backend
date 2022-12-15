import { CartService } from './../cart/cart.service';
import { OrderDto } from './dto/order.dto';
import { IOrder } from './../mongo-models/order.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { PaginationDto, PaginationService, SlackService, UsersService, WebsocketGateway } from "oteos-backend-lib";

@Injectable()
export class OrdersService {

    constructor(
        private readonly paginationService: PaginationService,
        private readonly websocketService: WebsocketGateway,
        private readonly slackService: SlackService,
        @Inject('MODEL')
        private OrderModel: Model<IOrder>,
        private readonly usersService: UsersService,
        private readonly cartsService: CartService,
    ) { }

    async fetchOrders(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();

        let page: number;
        let totalItemsPage: number;

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
     
        if (query["page"]) {
            page = query["page"];
        }
        if (query["totalItemsPage"]) {
            totalItemsPage = query["totalItemsPage"];
        }

        try { 
            pagination.totalItems = await this.OrderModel.countDocuments(where);
            pagination.items = await this.OrderModel.find(where).populate(
                {
                    path: 'cart',
                    populate: {
                        path: 'products',
                        model: 'Product',
                    },
                }
            );

            // No Pagination
            if (!page && !totalItemsPage) {
                return pagination;
            }

            // Control Pagination Query Values
            let controlValues: any[] = await this.paginationService.controlDefaultPaginationValues(page, totalItemsPage);
            page = controlValues[0];
            totalItemsPage = controlValues[1];

            // Check And Get Total Pages Value (Can be undefined)
            pagination.totalPages = await this.paginationService.getTotalPagesValue(totalItemsPage, pagination.items);

            // Check If Page Param Informed Is Greater Than Last Page Of Collection Calculated
            page = await this.paginationService.controlIfCurrentPageIsGreaterThanLastPage(page, pagination.totalPages);

            // Check And Get Skip Value
            let skip: number = await this.paginationService.getSkipValue(page, totalItemsPage);
        
            // Get Paginated Items
            pagination.items = await this.OrderModel.find(where).skip(skip).limit(parseInt(totalItemsPage.toString())).populate(
                {
                    path: 'cart',
                    populate: {
                        path: 'products',
                        model: 'Product',
                    },
                }
            );
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[fetchOrders] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            
            return newOrder;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[createOrder] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            return existOrder;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[updateOrder] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[findOrder] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            deleted = true;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[deleteCart] ${err.status} - ${err.message}`, 
                "error",
            );

            console.error("[deleteCart] ", err);
            throw new Error(err);
        }

        return deleted;
    }

    // WEBSOCKET: Notify change to all clients
    async notifyWebsockets(){
        try {
            console.log("[WS_ORDERS] Actualizacion");
            this.websocketService.sendMessageBroadcast('WS_ORDERS', true);
        } catch (err) {
            console.error('[Websocket] Emit error - buffer free');
            console.error(err);

            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[Websocket] ${err.status} - ${err.message}`, 
                "error",
            );
            console.error("[notifyWebsockets] ", err);
            return null;
        }
    }
}
