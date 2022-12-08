import { Schema } from "mongoose";

export interface ICategory {
    name: string;
    typeObj?: string;
}

export const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        typeObj: { 
            type: String, 
            required: false, 
            default: 'Category' 
        }
    },
    {
        timestamps: true
    }
);