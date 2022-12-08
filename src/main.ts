import { ConfigService } from '@nestjs/config';
import { LoggerService } from "oteos-backend-lib";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new LoggerService() });

  const configService = app.get<ConfigService>(ConfigService);
  const production = configService.get("app.production");

  if (production == 'false') {
    const options = new DocumentBuilder()
      .setTitle("Tfg Lorenzo Backend")
      .setDescription("API description")
      .setVersion("1")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth" // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("swagger", app, document);
  }

  app.enableCors();

  const port = configService.get("app.port");
  await app.listen(port);
  console.log("Start in port " + port);
}
bootstrap();
