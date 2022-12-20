import { CartDto } from './dto/cart.dto';
import { ICart } from './../mongo-models/cart.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { IUser, PaginationDto, UsersService } from "oteos-backend-lib";

@Injectable()
export class CartService {

    constructor(
        @Inject('MODEL')
        private CartModel: Model<ICart>,
        private readonly usersService: UsersService,
    ) { }

    async fetchCarts(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();


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
        try {
            pagination.items = await this.CartModel.find(where).populate('user').populate('products');
            return pagination;
        } catch (err) {
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
            return newCart;
        } catch (err) {
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
            return existCart;
        } catch (err) {
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
            deleted = true;
        } catch (err) {
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
            console.error("[findCart] ", err);  
        }

        return null;
    }
}
