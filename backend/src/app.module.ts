import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { BuildPCModule } from './build-pc/build-pc.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AdminModule } from './admin/admin.module';
import { BannersModule } from './banners/banners.module';
import { BrandsModule } from './brands/brands.module';
import { BuildOrdersModule } from './build-orders/build-orders.module';
import { FiltersModule } from './filters/filters.module';
import { UploadModule } from './upload/upload.module';
import { SectionsModule } from './sections/sections.module';
import { DisplayCategoriesModule } from './display-categories/display-categories.module';
import { PaymantsModule } from './paymants/paymants.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CouponsModule } from './coupons/coupons.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'images'),
      serveRoot: '/images',
    }),
    ConfigModule.forRoot({
      // ...
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    BuildPCModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    AdminModule,
    BannersModule,
    BrandsModule,
    BuildOrdersModule,
    FiltersModule,
    FiltersModule,
    UploadModule,
    SectionsModule,
    DisplayCategoriesModule,
    PaymantsModule,
    ChatbotModule,
    CouponsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

