import { CategoriesService } from './../categories/categories.service';
import { ProductDto } from './dto/product.dto';
import { IProduct } from './../mongo-models/product.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { PaginationDto } from "oteos-backend-lib";
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {

    constructor(
        @Inject('MODEL')
        private ProductModel: Model<IProduct>,
        private readonly categoriesService: CategoriesService,
        private readonly configService: ConfigService,
    ) { }

    async fetchProducts(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();

        let where: any = {};
        if (query["code"]) {
            where["code"] = query["code"];
        }
        if (query["name"]) {
            where["name"] = query["name"];
        }
        if (query["category"]) {
            const category = await this.categoriesService.findCategory(query["category"]);
            if (category) {
                where["category"] = category;
            }
        }
        if (query["tax"]) {
            where["tax"] = query["tax"];
        }

        try { 
            pagination.items = await this.ProductModel.find(where).populate({
                path: 'category',
                model: 'Category',
            });
            return pagination;
        } catch (err) {
            console.error("[fetchProducts] ", err);
            throw new Error(err);
        }

        return pagination;
    }

    async createproduct(product: ProductDto): Promise<IProduct> {
        const existProduct = await this.findProduct(product.code);
        if(existProduct){
            console.log("[createproduct] Product " + product.code + " already exist");
            throw new ConflictException('Product ' + product.code + ' already exist');
        }

        const existCategory = await this.categoriesService.findCategory(product.category.name);
        if(!existCategory){
            console.log("[createproduct] Category " + product.category.name + " not exist");
            throw new ConflictException('Category ' + product.category.name + ' not exist');
        }

        try {
            const newProduct = new this.ProductModel({
                code: product.code,
                category: existCategory,
                name: product.name,
                description: product.description,
                price: product.price,
                tax: product.tax,
                publicSellPrice: product.publicSellPrice,
                stock: product.stock,
            });

            await newProduct.save();
            
            console.log("[createproduct] Create new product: ", newProduct);
            return newProduct;
        } catch (err) {
            console.log("[createproduct] ", err);
            throw new Error(err);
        }
    }

    async updateProduct(code: string, newProduct: ProductDto): Promise<IProduct> {
        const existProduct = await this.findProduct(code);
        if (!existProduct) {
            console.error("[updateProduct] Product " + code + " not found");
            throw new ConflictException('Product ' + code + ' not found');
        }
        
        const existCategory = await this.categoriesService.findCategory(newProduct.category.name);
        if (!existCategory) {
            console.log("[updateProduct] Category " + newProduct.category.name + " not exist");
            throw new ConflictException('Category ' + newProduct.category.name + ' not exist');
        }

        try {
            const updateProduct: any = {
                code: existProduct.code,
                category: existCategory,
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                tax: newProduct.tax,
                publicSellPrice: newProduct.publicSellPrice,
                stock: newProduct.stock,
            }

            Object.assign(existProduct, updateProduct);
            await existProduct.save();

            console.log('[updateProduct] Product ' + code + ' updated to ' + newProduct);  
            return existProduct;
        } catch (err) {
            console.log("[updateProduct] ", err);
            throw new Error(err);
        }

        return null;
    }

    async deleteProduct(code: string) {    
        const product = await this.findProduct(code);
        if(!product){
            console.log("[deleteProduct] Product " + code + " not found");
            throw new ConflictException('Product ' + code + ' not found');
        }

        let deleted: boolean = false;
        try {
            await product.delete();
            console.log('[deleteProduct] Product ' + code + ' deleted');
            deleted = true;
        } catch (err) {
            console.error("[deleteProduct] ", err);
            throw new Error(err);
        }

        return deleted;
    }

    async setImageToProduct(code: string, file: Express.Multer.File): Promise<boolean> {
        const product: IProduct = await this.findProduct(code);
        if(!product){
            console.log("[setImageToProduct] Product " + code + " not found");
            throw new ConflictException('Product ' + code + ' not found');
        }

        let savedImaeg: boolean = false;

        try {
            const path: string = this.configService.get("app.serverPath");

            const existFolder: boolean = fs.existsSync(path);
            if (!existFolder) {
                fs.mkdirSync(path);
            }

            const extension: string = 'jpeg';
            fs.writeFileSync(`${path}/${product.code}.${extension}`, file.buffer);
            savedImaeg = true;
        } catch (err) {
            console.error("[setImageToProduct] ", err);
            throw new Error(err);
        }

        return savedImaeg;
    }

    async findProduct(code: string) {
        try {
            const product = await this.ProductModel.findOne({ code: code });
            return product;
        } catch (err) {
            console.error("[findProduct] ", err);  
        }

        return null;
    }

    async findProductByName(name: string) {
        try {
            const product = await this.ProductModel.findOne({ name: name });
            return product;
        } catch (err) {
            console.error("[findProductByName] ", err);  
        }

        return null;
    }
}
