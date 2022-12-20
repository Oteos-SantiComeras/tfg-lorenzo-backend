import { CategoryDto } from './dto/category.dto';
import { ICategory } from './mongo-model/category.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { PaginationDto } from "oteos-backend-lib";
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {

    constructor(
        @Inject('MODEL')
        private CategoryModel: Model<ICategory>
    ) { 
        
    }
    
    async fetchCategories(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();        

        let where: any = {};
        if (query["name"]) {
            where["name"] = query["name"];
        }

        try { 
            pagination.items = await this.CategoryModel.find(where);
            return pagination;
        } catch (err) {
            console.error("[fetchCategories] ", err);
            throw new Error(err);
        }

        return pagination;
    }
    
    async createCategory(category: CategoryDto): Promise<ICategory> {
        const existCategory = await this.findCategory(category.name);
        if(existCategory){
            console.log("[createCategory] Category " + category.name + " already exist");
            throw new ConflictException('Category ' + category.name + ' already exist');
        }

        try {
            const newCategory = new this.CategoryModel({
                name: category.name,
            });

            await newCategory.save();
            
            console.log("[createCategory] Create new category: ", newCategory);
            return newCategory;
        } catch (err) {
            console.log("[createCategory] ", err);
            throw new Error(err);
        }
    }
    
    async updateCategory(name: string, newCategory: CategoryDto): Promise<ICategory> {
        const existCategory = await this.findCategory(name);
        if (!existCategory) {
            console.error("[updateCategory] Category " + name + " not found");
            throw new ConflictException('Category ' + name + ' not found');
        }
        
        const existCategoryUpdate = await this.findCategory(newCategory.name);
        if (existCategoryUpdate && (existCategoryUpdate.name != existCategory.name)) {
            console.log("[updateCategory] Category " + newCategory.name + " already exist");
            throw new ConflictException('Category ' + newCategory.name + ' already exist');
        }

        try {
            Object.assign(existCategory, newCategory);
            await existCategory.save();

            console.log('[updateCategory] Category ' + name + ' updated to ' + newCategory.name);
            return existCategory;
        } catch (err) {
            console.log("[updateCategory] ", err);
            throw new Error(err);
        }

        return null;
    }
    
    async deleteCategory(name: string) {    
        const category = await this.findCategory(name);
        if(!category){
            console.log("[deleteCategory] Category " + name + " not found");
            throw new ConflictException('Category ' + name + ' not found');
        }

        let deleted: boolean = false;
        try {
            await category.delete();
            console.log('[deleteCategory] Category ' + name + ' deleted');
            deleted = true;
        } catch (err) {
            console.error("[deleteCategory] ", err);
            throw new Error(err);
        }

        return deleted;
    }
    
    async findCategory(name: string) {
        try {
            const category = await this.CategoryModel.findOne({ name });
            return category;
        } catch (err) {
            console.error("[findCategory] ", err);  
        }

        return null;
    }

    async findCategoryById(_id: string) {
        try {
            const category = await this.CategoryModel.findOne({ _id: _id });
            return category;
        } catch (err) {
            console.error("[findCategory] ", err);  
        }

        return null;
    }
}
