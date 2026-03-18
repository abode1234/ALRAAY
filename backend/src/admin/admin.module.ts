import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ProductsModule } from '../products/products.module';
import { BuildPCModule } from '../build-pc/build-pc.module';
import { OrdersModule } from '../orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ProductsModule, BuildPCModule, OrdersModule, PrismaModule],
  controllers: [AdminController],
})
export class AdminModule {}

