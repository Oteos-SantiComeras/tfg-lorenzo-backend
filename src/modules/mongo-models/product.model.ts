import { ObjectId, Schema, Types } from 'mongoose';

export interface IProduct {
  code: string;
  category: ObjectId;
  name: string;
  description: string;
  price: number;
  tax: number;
  publicSellPrice: number;
  stock: number;
  image: string;
  typeObj?: string;
}

export const productSchema = new Schema<IProduct>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    publicSellPrice: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    typeObj: { 
      type: String, 
      required: false, 
      default: 'Product' 
    }
  },
  {
    timestamps: true,
  },
);