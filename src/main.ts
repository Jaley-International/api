import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UploadFoldersManager } from './utils/uploadFoldersManager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('PEC API')
    .setDescription('The Private Encrypted Cloud API description')
    .setVersion('0.1')
    .addTag('PEC')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PEC_API_PORT);
}
bootstrap();
UploadFoldersManager.purgeTmpFolder();
