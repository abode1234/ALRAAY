import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { ChatbotModule } from './chatbot/chatbot.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());



  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4000',
      'http://localhost:4001', // Admin dashboard
      'http://localhost:4003', // other if any
      'http://alraay.net',
      'https://alraay.net',
      'http://145.223.100.194',
      'https://145.223.100.194',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Main API Documentation (All Modules)
  const config = new DocumentBuilder()
    .setTitle('Alatian API')
    .setDescription('Alatian E-commerce API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Dedicated Chatbot API Documentation (Only ChatbotModule)
  const chatbotConfig = new DocumentBuilder()
    .setTitle('Alatian Chatbot Data Synchronization API')
    .setDescription('Exclusive API documentation for the Chatbot Provider. \n\n**Usage:** This endpoint retrieves all public products, brands, categories, and PC builds. Your chatbot should fetch this data periodically to keep its context updated. Search and filtering should be performed on your end using this synchronized dataset.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const chatbotDocument = SwaggerModule.createDocument(app, chatbotConfig, {
    include: [ChatbotModule],
  });
  SwaggerModule.setup('api/chatbot-docs', app, chatbotDocument);

  const port = process.env.PORT || 4002;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Products: /products`);
  console.log(`   - Cart: /cart`);
  console.log(`   - Build PC: /build-pc`);
  console.log(`   - Orders: /orders`);
  console.log(`   - Reviews: /reviews`);
  console.log(`   - Wishlist: /wishlist`);
  console.log(`   - Admin: /admin`);
}
bootstrap();
