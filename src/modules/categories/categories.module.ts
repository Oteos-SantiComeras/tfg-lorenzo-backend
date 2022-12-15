import { ICategory, categorySchema } from './../mongo-models/category.model';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { MongoDbService, PaginationModule, SlackModule } from "oteos-backend-lib";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PaginationModule,
    SlackModule,
  ],
  controllers: [
    CategoriesController
  ],
  providers: [
    CategoriesService,
    {
      provide: 'MODEL',
      useFactory: (db: MongoDbService) => db.getConnection().model<ICategory>('Category', categorySchema, 'categories'),
      inject: [MongoDbService]
    }
  ],
  exports: [
    CategoriesService
  ]
})
export class CategoriesModule { }
