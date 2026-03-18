import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../generated/prisma/client';
import { ProductsService } from '../products/products.service';
import { BuildPCService } from '../build-pc/build-pc.service';
import { OrdersService } from '../orders/orders.service';
import { CreateProductDto, UpdateProductDto } from '../products/dto/product.dto';
import { CreateBuildPCDto, UpdateBuildPCDto } from '../build-pc/dto/build-pc.dto';
import { UpdateOrderStatusDto } from '../orders/dto/order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private productsService: ProductsService,
    private buildPCService: BuildPCService,
    private ordersService: OrdersService,
    private prisma: PrismaService,
  ) { }

  // Product Management
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('products')
  getAllProducts() {
    return this.productsService.findAll({ includeOutOfStock: true });
  }

  // Build PC Templates Management
  @Post('build-templates')
  createTemplate(@CurrentUser() user: any, @Body() dto: CreateBuildPCDto) {
    return this.buildPCService.create(user.userId, { ...dto, isTemplate: true }, true);
  }

  @Get('build-templates')
  getTemplates() {
    return this.buildPCService.findAll(undefined, true);
  }

  @Patch('build-templates/:id')
  updateTemplate(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateBuildPCDto) {
    return this.buildPCService.update(id, user.userId, dto, true);
  }

  @Delete('build-templates/:id')
  deleteTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.buildPCService.delete(id, user.userId, true);
  }

  // Order Management
  @Get('orders')
  getAllOrders(@Query('status') status?: string) {
    return this.ordersService.findAll(undefined, status);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  // Statistics
  @Get('stats')
  async getStats() {
    const [totalProducts, totalOrders, totalUsers, pendingOrders] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count({ where: { status: { not: 'AWAITING_PAYMENT' as any } } }),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    const revenueResult = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['DELIVERED', 'SHIPPED'] } },
    });

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      totalRevenue: revenueResult._sum.totalAmount || 0,
    };
  }
}

