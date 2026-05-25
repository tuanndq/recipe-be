import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
  mkdirSync(uploadDir, { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const appUrl = process.env.APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  const config = new DocumentBuilder()
    .setTitle('Cooking Recipe API')
    .setDescription(
      'Search and browse cooking recipes by ingredients and cuisine. Admin endpoints require JWT.',
    )
    .setVersion('1.0')
    .addServer(appUrl)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
}

bootstrap();
