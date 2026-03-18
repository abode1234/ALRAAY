import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, dto: CreateOrderDto) {
    // Get cart items
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check stock availability (skip custom build items and service products)
    for (const item of cartItems) {
      if (item.buildComponents || item.product.category === 'service') continue;
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
      }
    }

    // Calculate total base and check coupons
    let subtotal = 0;
    let discountAmount = 0;

    // Optional coupon check
    let coupon: any = null;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
        include: { applicableProducts: true, applicableBuilds: true }
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid or inactive coupon code');
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        throw new BadRequestException('Coupon code has expired');
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }
    }

    // Process items and calculate total / discounts
    for (const item of cartItems) {
      const itemPrice = Number(item.customPrice || item.product.price);
      subtotal += itemPrice * item.quantity;

      // Check if product is eligible for the coupon
      if (coupon) {
        let isEligible = false;
        
        // Check if regular product is in applicableProducts
        if (!item.buildComponents && coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          isEligible = coupon.applicableProducts.some((p: any) => p.id === item.productId);
        }
        
        // If it's a build, check against applicableBuilds
        if (item.buildComponents && coupon.applicableBuilds && coupon.applicableBuilds.length > 0) {
          // Simplification for explicit checks
        }

        // Apply discount if eligible
        if (isEligible || ((!coupon.applicableProducts || coupon.applicableProducts.length === 0) && (!coupon.applicableBuilds || coupon.applicableBuilds.length === 0))) {
           // if no restrictions, apply to all items
           if (coupon.discountType === 'PERCENTAGE') {
             discountAmount += (itemPrice * Number(coupon.discountValue) / 100) * item.quantity;
           } else if (coupon.discountType === 'FIXED') {
             // Fixed is trickier per item. We'll apply it globally instead of per item later.
           }
        }
      }
    }

    if (coupon && coupon.discountType === 'FIXED') {
      discountAmount = Number(coupon.discountValue);
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    // Calculate delivery fee based on city
    const city = (dto.shippingAddress as any)?.city ?? '';
    const deliveryFee = city === 'بغداد' ? 5000 : 10000;
    const totalAmount = subtotal - discountAmount + deliveryFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // SindiPay orders start as AWAITING_PAYMENT so they are hidden from admin
    // until payment is confirmed. COD orders start as PENDING and are visible immediately.
    const initialStatus = dto.paymentMethod === 'SINDIPAY'
      ? OrderStatus.AWAITING_PAYMENT
      : OrderStatus.PENDING;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        totalAmount,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: coupon?.code || undefined,
        shippingAddress: dto.shippingAddress,
        status: initialStatus,
        statusHistory: [
          {
            status: initialStatus,
            timestamp: new Date().toISOString(),
            message: dto.paymentMethod === 'SINDIPAY' ? 'Awaiting payment' : 'Order placed',
          },
        ],
        items: {
          create: cartItems.map(item => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: item.customPrice || item.product.price,
            customPrice: item.customPrice,
            buildComponents: item.buildComponents as any,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Create BuildOrders for custom builds
    for (const item of cartItems) {
      if (item.buildComponents) {
        // Map Status (assuming New)
        // Extract shipping info safely
        const shippingAddress = dto.shippingAddress as any;
        const phone = shippingAddress?.phone || 'N/A';
        const addressStr = [shippingAddress?.street, shippingAddress?.city, shippingAddress?.country].filter(Boolean).join(', ');

        await this.prisma.buildOrder.create({
          data: {
            orderNumber: `${order.orderNumber}-BUILD-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            customerPhone: phone,
            customerName: userId, // ideally fetch user name, but userId is okay or we fetch user above
            customerAddress: addressStr,
            totalAmount: item.customPrice || 0,
            components: item.buildComponents as any, // Cast to any/JSON
            status: 'NEW',
          }
        });
      }
    }

    // Update coupon usage
    if (coupon) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      });
    }

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId } });

    return order;
  }

  async findAll(userId?: string, status?: string) {
    // Admin sees all orders except those awaiting online payment confirmation.
    // Regular users see all their own orders (including AWAITING_PAYMENT so they can track status).
    const where: any = userId
      ? { userId }
      : { status: { not: OrderStatus.AWAITING_PAYMENT } };

    // Apply status filter if provided (for admin filtering)
    if (status && !userId) {
      where.status = status as OrderStatus;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const statusHistory = [
      ...((order.statusHistory as any[]) || []),
      {
        status: dto.status,
        timestamp: new Date().toISOString(),
        message: `Order status updated to ${dto.status}`,
      },
    ];

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status as OrderStatus,
        trackingNumber: dto.trackingNumber,
        statusHistory,
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Decrement stock only when order is marked as DELIVERED
    if (dto.status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
      for (const item of order.items) {
        if (item.buildComponents || item.product.category === 'service') continue;
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return updatedOrder;
  }

  async trackOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

