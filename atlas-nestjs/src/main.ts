import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-feature'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(process.env.PORT ?? 4001);
}

bootstrap();
