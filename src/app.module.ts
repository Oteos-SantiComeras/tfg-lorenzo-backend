import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { configurationSlack } from './configuration/configuration-slack';
import {
  MongoDbConfig,
  MongoDbModule,
  WebsocketModule,
  EmailerConfig,
  EmailerModule,
  LoggerModule,
  GlobalConfigurationModule,
  AuthConfig,
  AuthModule,
  PermissionsModule,
  RolesModule,
  UsersModule,
  PaginationModule,
  SlackModule,
  SlackConfig,
  CompaniesModule,
} from "oteos-backend-lib";
import { PublicMiddleware } from "./middlewares/public.middleware";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configurationApp } from "./configuration/configuration-app";
import { configurationAuth } from "./configuration/configuration-auth";
import { configurationEmailer } from "./configuration/configuration-emailer";
import { configurationMongo } from "./configuration/configuration-mongo";
import { PopulateModule } from "./modules/populate/populate.module";
import { configurationSftp } from './configuration/configuration-sftp';
require("dotenv").config();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configurationApp, configurationMongo, configurationAuth, configurationEmailer, configurationSlack, configurationSftp],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
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
    WebsocketModule.register({
      port: 8181,
    }),
    PermissionsModule,
    RolesModule,
    CompaniesModule,
    UsersModule,
    AuthModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const authConfig: AuthConfig = {
          secret: configService.get("auth.secretKey"),
          signOptions: { 
            expiresIn: configService.get("auth.expiresIn") 
          }
        };
        return authConfig;
      },
      inject: [ConfigService],
    }),
    LoggerModule,
    PaginationModule,
    GlobalConfigurationModule,
    SlackModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const slackConfig: SlackConfig = {
          token: configService.get("slack.token"),
          name: configService.get("slack.name"),
          appChannel: configService.get("slack.appChannel"),
        };
        return slackConfig;
      },
      inject: [ConfigService],
    }),
    EmailerModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const emailerConfig: EmailerConfig = {
          sending_Email_Address: configService.get("emailer.address"),
          sending_Email_Password: configService.get("emailer.password"),
        };
        return emailerConfig;
      },
      inject: [ConfigService],
    }),
    CategoriesModule,
    ProductsModule,
    PopulateModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes("*");
  }
}