import { ConfigService } from '@nestjs/config';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get("app.port");

  await app.listen(port);
  console.log("Iniciado en el puerto " + port);
}
bootstrap();
