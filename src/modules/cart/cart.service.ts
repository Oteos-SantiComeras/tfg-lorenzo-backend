import { CartDto } from './dto/cart.dto';
import { ProductsService } from './../products/products.service';
import { ICart } from './../mongo-models/cart.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { IUser, PaginationDto, PaginationService, SlackService, UsersService, WebsocketGateway } from "oteos-backend-lib";

@Injectable()
export class CartService {

    constructor(
        private readonly paginationService: PaginationService,
        private readonly websocketService: WebsocketGateway,
        private readonly slackService: SlackService,
        @Inject('MODEL')
        private CartModel: Model<ICart>,
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
    ) { }

    async fetchCarts(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();

        let page: number;
        let totalItemsPage: number;

        let where: any = {};

        const superAdmin = await this.usersService.findUser("superadmin");
        where["user"] = { $ne: superAdmin };

        if (query["_id"]) {
            where["_id"] = query["_id"];
        }

        if (query["user"]) {
            const user = await this.usersService.findUser(query["user"]);
           
            if (user) {
                where["user"] = { $ne: superAdmin, $eq: user };
            }
        }
        if (query["page"]) {
            page = query["page"];
        }
        if (query["totalItemsPage"]) {
            totalItemsPage = query["totalItemsPage"];
        }

        try { 
            pagination.totalItems = await this.CartModel.countDocuments(where);
            pagination.items = await this.CartModel.find(where).populate('user').populate('products');

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
            pagination.items = await this.CartModel.find(where).skip(skip).limit(parseInt(totalItemsPage.toString())).populate({
                path: 'user',
                model: 'User',
            });
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[fetchCarts] ${err.status} - ${err.message}`, 
                "error",
            );

            console.error("[fetchCarts] ", err);
            throw new Error(err);
        }

        return pagination;
    }

    async createCart(cart: CartDto): Promise<ICart> {
        const existUser: IUser = await this.usersService.findUser(cart.user.userName);
        if (!existUser) {
            console.log("[createCart] User " + cart.user.userName + " not exist");
            throw new ConflictException('User ' + cart.user.userName + ' not exist');
        }

        if (cart && cart._id) {
            const existCart = await this.findCart(cart._id);
            if(existCart){
                console.log("[createCart] Cart " + cart._id + " already exist");
                throw new ConflictException('Cart ' + cart._id + ' already exist');
            }
        }

        try {
            const newCart = new this.CartModel({
                user: existUser,
                products: cart.products,
                amounts: cart.amounts,
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                totalPriceTaxs: cart.totalPriceTaxs,
            });

            await newCart.save();
            
            console.log("[createCart] Create new cart: ", newCart);
            this.notifyWebsockets();
            
            return newCart;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[createCart] ${err.status} - ${err.message}`, 
                "error",
            );

            console.log("[createCart] ", err);
            throw new Error(err);
        }
    }

    async updateCart(_id: string, newCart: CartDto): Promise<ICart> {
        const existUser: IUser = await this.usersService.findUser(newCart.user.userName);
        if (!existUser) {
            console.log("[updateProduct] User " + newCart.user.userName + " not exist");
            throw new ConflictException('User ' + newCart.user.userName + ' not exist');
        }

        const existCart = await this.findCart(_id);
        if(!existCart){
            console.log("[updateProduct] Cart " + _id + " not exist");
            throw new ConflictException('Cart ' + _id + ' not exist');
        }

        try {
            const updateCart: any = {
                _id: existCart["_id"],
                user: existUser,
                products: newCart.products,
                amounts: newCart.amounts,
                totalItems: newCart.totalItems,
                totalPrice: newCart.totalPrice,
                totalPriceTaxs: newCart.totalPriceTaxs,
            }

            Object.assign(existCart, updateCart);
            await existCart.save();

            console.log('[updateProduct] Cart ' + _id + ' updated to ' + newCart);
            this.notifyWebsockets();
            return existCart;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[updateProduct] ${err.status} - ${err.message}`, 
                "error",
            );

            console.log("[updateProduct] ", err);
            throw new Error(err);
        }

        return null;
    }

    async deleteCart(_id: string) {    
        const cart = await this.findCart(_id);
        if (!cart) {
            console.log("[deleteCart] Cart " + _id + " not found");
            throw new ConflictException('Cart ' + _id + ' not found');
        }

        let deleted: boolean = false;
        try {
            await cart.delete();
            console.log('[deleteCart] Cart ' + _id + ' deleted');
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

    async findCart(_id: string) {
        try {
            const cart = await this.CartModel.findOne({ _id: _id });
            return cart;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[findCart] ${err.status} - ${err.message}`, 
                "error",
            );

            console.error("[findCart] ", err);  
        }

        return null;
    }

    // WEBSOCKET: Notify change to all clients
    async notifyWebsockets(){
        try {
            console.log("[WS_CARTS] Actualizacion");
            this.websocketService.sendMessageBroadcast('WS_CARTS', true);
        } catch (err) {
            console.error('[Websocket] Emit error - buffer free');
            console.error(err);

            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[Websocket] ${err.status} - ${err.message}`, 
                "error",
            );
            console.error("[fetchPermission] ", err);
            return null;
        }
    }
}
