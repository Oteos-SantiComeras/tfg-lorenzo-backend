import { ObjectId, Schema, Types } from "mongoose";

export interface IOrder {
    cart: ObjectId;
    paidOut: boolean;
    name: string;
    secondName: string;
    email: string;
    phone: number;
    country: string;
    address: string;
    zipCode: number;
    typeObj?: string;
}

export const orderSchema = new Schema<IOrder>(
    {
        cart: {
            type: Types.ObjectId,
            ref: 'Cart',
            required: true,
            unique: true,
        },
        paidOut: {
            type: Boolean,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        secondName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        zipCode: {
            type: Number,
            required: true,
        },
        typeObj: { 
            type: String, 
            required: false, 
            default: 'Order' 
        }
    },
    {
        timestamps: true
    }
);