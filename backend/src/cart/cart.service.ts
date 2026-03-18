import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';
import { AddToCartDto, AddBuildToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    if (dto.components) {

      // Calculate total price from components safely
      let totalCustomPrice = 0;
      const componentsObj = dto.components;

      if (componentsObj && typeof componentsObj === 'object') {
        for (const key in componentsObj) {
          if (Object.prototype.hasOwnProperty.call(componentsObj, key)) {
            const component = componentsObj[key];
            if (Array.isArray(component)) {
              // Multi-select categories (RAM, STORAGE) send arrays
              for (const item of component) {
                if (item && typeof item.price === 'number') {
                  totalCustomPrice += item.price;
                } else if (item && typeof item.price === 'string') {
                  totalCustomPrice += parseFloat(item.price);
                }
              }
            } else if (component && typeof component.price === 'number') {
              totalCustomPrice += component.price;
            } else if (component && typeof component.price === 'string') {
              totalCustomPrice += parseFloat(component.price);
            }
          }
        }
      }

      // If components are passed, we create a new item every time (no merging)
      return this.prisma.cartItem.create({
        data: {
          userId,
          productId: dto.productId,
          quantity: dto.quantity,
          buildComponents: dto.components,
          customPrice: totalCustomPrice,
        },
        include: { product: true },
      });
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId: dto.productId, buildComponents: { equals: Prisma.AnyNull } },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + dto.quantity;
      if (product.stock < newQuantity) throw new BadRequestException('Insufficient stock');
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId: dto.productId, quantity: dto.quantity },
      include: { product: true },
    });
  }

  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce((sum, item) => sum + Number(item.customPrice || item.product.price) * item.quantity, 0);
    return {
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async updateCartItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true },
    });
    if (!cartItem) throw new NotFoundException('Cart item not found');
    if (cartItem.product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({ where: { id: cartItemId, userId } });
    if (!cartItem) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return { message: 'Item removed from cart' };
  }

  async addBuildToCart(userId: string, dto: AddBuildToCartDto) {
    // Auto-create or find the service product for custom builds
    let serviceProduct = await this.prisma.product.findFirst({
      where: { name: 'Custom PC Build' },
    });

    if (!serviceProduct) {
      serviceProduct = await this.prisma.product.create({
        data: {
          name: 'Custom PC Build',
          description: 'تجميعة كمبيوتر مخصصة',
          price: 0,
          brand: 'alraay',
          category: 'service',
          stock: 99999,
          specifications: {},
          images: [],
        },
      });
    } else {
      // Ensure service product always has sufficient stock (reset if low)
      const updateData: any = {};
      if (serviceProduct.brand !== 'alraay') updateData.brand = 'alraay';
      if (serviceProduct.stock < 100) updateData.stock = 99999;
      if (Object.keys(updateData).length > 0) {
        serviceProduct = await this.prisma.product.update({
          where: { id: serviceProduct.id },
          data: updateData,
        });
      }
    }

    // Calculate total price from components
    let totalCustomPrice = 0;
    const componentsObj = dto.components;
    if (componentsObj && typeof componentsObj === 'object') {
      for (const key in componentsObj) {
        if (Object.prototype.hasOwnProperty.call(componentsObj, key)) {
          const component = componentsObj[key];
          if (Array.isArray(component)) {
            // Multi-select categories (RAM, STORAGE) send arrays
            for (const item of component) {
              if (item && typeof item.price === 'number') {
                totalCustomPrice += item.price;
              } else if (item && typeof item.price === 'string') {
                totalCustomPrice += parseFloat(item.price);
              }
            }
          } else if (component && typeof component.price === 'number') {
            totalCustomPrice += component.price;
          } else if (component && typeof component.price === 'string') {
            totalCustomPrice += parseFloat(component.price);
          }
        }
      }
    }

    const finalPrice = dto.discountAmount
      ? Math.max(0, totalCustomPrice - dto.discountAmount)
      : totalCustomPrice;

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: serviceProduct.id,
        quantity: 1,
        buildComponents: dto.components,
        customPrice: finalPrice,
      },
      include: { product: true },
    });
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }
}

