import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    const { applicableProductIds, applicableBuildIds, applicableCategories, ...rest } = data;

    return this.prisma.coupon.create({
      data: {
        ...rest,
        code: data.code.toUpperCase(),
        applicableCategories: applicableCategories || [],
        applicableProducts: applicableProductIds && applicableProductIds.length > 0 ? {
          connect: applicableProductIds.map(id => ({ id }))
        } : undefined,
        applicableBuilds: applicableBuildIds && applicableBuildIds.length > 0 ? {
          connect: applicableBuildIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        applicableProducts: true,
        applicableBuilds: true,
      }
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        applicableProducts: { select: { id: true, name: true } },
        applicableBuilds: { select: { id: true, name: true } },
      }
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        applicableProducts: true,
        applicableBuilds: true,
      }
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        applicableProducts: { select: { id: true } },
        applicableBuilds: { select: { id: true } },
      }
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async validateCartCoupon(code: string, cartItems: any[]) {
    if (!cartItems || cartItems.length === 0) {
      return { isValid: false, discountAmount: 0, discountType: 'PERCENTAGE', message: 'السلة فارغة' };
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { applicableProducts: true, applicableBuilds: true }
    });

    if (!coupon || !coupon.isActive) {
      return { isValid: false, discountAmount: 0, discountType: 'PERCENTAGE', message: 'كود الخصم غير صحيح أو غير مفعل' };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { isValid: false, discountAmount: 0, discountType: 'PERCENTAGE', message: 'عذراً، انتهت صلاحية هذا الكود' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { isValid: false, discountAmount: 0, discountType: 'PERCENTAGE', message: 'تم تجاوز الحد الأقصى لاستخدام هذا الكود' };
    }

    let subtotal = 0;
    let discountAmount = 0;

    const hasProductFilter = coupon.applicableProducts && coupon.applicableProducts.length > 0;
    const hasCategoryFilter = coupon.applicableCategories && coupon.applicableCategories.length > 0;
    const hasAnyFilter = hasProductFilter || hasCategoryFilter;

    for (const item of cartItems) {
      const itemPrice = Number(item.customPrice || item.product?.price || item.price || 0);
      subtotal += itemPrice * item.quantity;

      let isEligible = !hasAnyFilter; // eligible by default if no filter set

      if (!isEligible && hasProductFilter) {
        const productId = item.productId || item.product?.id;
        if (coupon.applicableProducts.some((p: any) => p.id === productId)) {
          isEligible = true;
        }
      }

      if (!isEligible && hasCategoryFilter) {
        const productCategory = (item.product?.category || '').toLowerCase();
        if (coupon.applicableCategories.some((c: string) => c.toLowerCase() === productCategory)) {
          isEligible = true;
        }
      }

      if (isEligible && coupon.discountType === 'PERCENTAGE') {
        discountAmount += (itemPrice * Number(coupon.discountValue) / 100) * item.quantity;
      }
    }

    if (coupon.discountType === 'FIXED') {
      discountAmount = Number(coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    if (discountAmount <= 0) {
      return { isValid: false, discountAmount: 0, discountType: coupon.discountType, message: 'هذا الكود لا ينطبق على المنتجات الموجودة في السلة' };
    }

    return { 
      isValid: true, 
      discountAmount, 
      discountType: coupon.discountType 
    };
  }

  async update(id: string, data: UpdateCouponDto) {
    await this.findOne(id); // Ensure it exists

    if (data.code) {
      const existing = await this.prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    const { applicableProductIds, applicableBuildIds, applicableCategories, ...rest } = data;

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...rest,
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(applicableCategories !== undefined && { applicableCategories }),
        applicableProducts: applicableProductIds ? {
          set: applicableProductIds.map(pid => ({ id: pid }))
        } : undefined,
        applicableBuilds: applicableBuildIds ? {
          set: applicableBuildIds.map(bid => ({ id: bid }))
        } : undefined,
      },
      include: {
        applicableProducts: true,
        applicableBuilds: true,
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }
}

