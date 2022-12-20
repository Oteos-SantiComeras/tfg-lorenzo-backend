import { ObjectId, Schema, Types } from "mongoose";

export interface ICart {
    user: ObjectId;
    products?: ObjectId[];
    amounts?: number[];
    totalItems?: number;
    totalPrice?: number;
    totalPriceTaxs?: number;
    typeObj?: string;
}

export const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
            unique: false,
        },
        products: {
            type: [Types.ObjectId],
            ref: 'Product',
            required: false,
        },
        amounts: {
            type: [Number],
            required: false,
        },
        totalItems: {
            type: Number,
            required: false,
        },
        totalPrice: {
            type: Number,
            required: false,
        },
        totalPriceTaxs: {
            type: Number,
            required: false,
        },
        typeObj: { 
            type: String, 
            required: false, 
            default: 'Cart' 
        }
    },
    {
        timestamps: true
    }
);