import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import {
  MongoDbConfig,
  MongoDbModule,
  WebsocketModule,
  AuthConfig,
  AuthModule,
  PermissionsModule,
  RolesModule,
  UsersModule,
  PaginationModule,
} from "oteos-backend-lib";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configurationApp } from "./configuration/configuration-app";
import { configurationAuth } from "./configuration/configuration-auth";
import { configurationMongo } from "./configuration/configuration-mongo";
import { PopulateModule } from "./modules/populate/populate.module";
import { PublicMiddleware } from './middlewares/public.middleware';
require("dotenv").config();

@Module({
  imports: [
    // Cargar ficheros de configuración de entornos
    ConfigModule.forRoot({
      load: [configurationApp, configurationMongo, configurationAuth],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    // Cargar módulo de conexión DB mongo
    MongoDbModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoDB: MongoDbConfig = {
          ip: configService.get("mongo.ip"),
          port: parseInt(configService.get("mongo.port")),
          user: configService.get("mongo.user"),
          pass: configService.get("mongo.pass"),
          database: configService.get("mongo.database")
        };
        return mongoDB;
      },
      inject: [ConfigService],
    }),
    // Cargar módulo de websockets, dependencia para Permisos, roles y usuarios
    WebsocketModule.register({
      port: 8686,
    }),
    // Cargar módulo Auth, genera los token cuando el usuario se logea en la página
    AuthModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const authConfig: AuthConfig = {
          secret: configService.get("auth.secretKey"),
        };
        return authConfig;
      },
      inject: [ConfigService],
    }),
    // Cargar módulo Pagination, dependencia para Permisos, roles y usuarios.
    PaginationModule,
    // Cargar módulos permisos, roles y usuarios de la librería
    PermissionsModule,
    RolesModule,
    UsersModule,
    // Cargar módulos propios del backend
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    // Cargar módulo de populate (Comprueba si existen los datos basicos y necesarios en la DB, si no los inserta al inciar el proyecto)
    PopulateModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes("*");
  }
}