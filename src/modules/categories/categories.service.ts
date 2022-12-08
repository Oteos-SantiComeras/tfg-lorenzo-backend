import { CategoryDto } from './dto/category.dto';
import { ICategory } from './../mongo-models/category.model';
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { PaginationDto, PaginationService, SlackService, WebsocketGateway } from "oteos-backend-lib";
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {

    constructor(
        private readonly paginationService: PaginationService,
        private readonly websocketService: WebsocketGateway,
        private readonly slackService: SlackService,
        @Inject('MODEL')
        private CategoryModel: Model<ICategory>
    ) { 
        
    }
    
    async fetchCategories(query: any): Promise<PaginationDto> {
        let pagination: PaginationDto = new PaginationDto();

        let page: number;
        let totalItemsPage: number;

        let where: any = {};
        if (query["name"]) {
            where["name"] = query["name"];
        }
        if (query["page"]) {
            page = query["page"];
        }
        if (query["totalItemsPage"]) {
            totalItemsPage = query["totalItemsPage"];
        }

        try { 
            pagination.totalItems = await this.CategoryModel.countDocuments(where);
            pagination.items = await this.CategoryModel.find(where);

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
            pagination.items = await this.CategoryModel.find(where).skip(skip).limit(parseInt(totalItemsPage.toString()));
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[fetchCategories] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            
            return newCategory;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[createCategory] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            return existCategory;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[updateCategory] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.notifyWebsockets();
            deleted = true;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[deleteCategory] ${err.status} - ${err.message}`, 
                "error",
            );

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
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[findCategory] ${err.status} - ${err.message}`, 
                "error",
            );

            console.error("[findCategory] ", err);  
        }

        return null;
    }

    async findCategoryById(_id: string) {
        try {
            const category = await this.CategoryModel.findOne({ _id: _id });
            return category;
        } catch (err) {
            this.slackService.messageToChannel(
                SlackService.appChannel, 
                `[findCategory] ${err.status} - ${err.message}`, 
                "error",
            );

            console.error("[findCategory] ", err);  
        }

        return null;
    }
    
    // WEBSOCKET: Notify change to all clients
    async notifyWebsockets(){
        try {
            console.log("[WS_CATEGORIES] Actualizacion");
            this.websocketService.sendMessageBroadcast('WS_CATEGORIES', true);
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
