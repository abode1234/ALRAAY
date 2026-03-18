import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        category: dto.category,
        brand: dto.brand,
        images: dto.images || [],
        stock: dto.stock,
        powerConsumption: dto.powerConsumption,
        platform: dto.platform || null,
        socketType: dto.socketType || null,
        memoryType: dto.memoryType || null,
        isNewArrival: dto.isNewArrival !== undefined ? dto.isNewArrival : true, // Default true
        specifications: dto.specifications || {},
        sectionItems: dto.sectionIds ? {
          create: dto.sectionIds.map(id => ({ section: { connect: { id } } }))
        } : undefined,
      },
    });
  }

  async findAll(filters: ProductFilterDto) {
    const { category, brand, minPrice, maxPrice, isNewArrival, hasDiscount, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', includeOutOfStock } = filters;

    const where: any = {};
    // Hide out-of-stock products unless explicitly requested (admin)
    if (!includeOutOfStock) {
      where.stock = { gt: 0 };
    }
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (brand) where.brand = brand;
    if (isNewArrival !== undefined) {
      where.isNewArrival = isNewArrival;
      if (isNewArrival) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        where.createdAt = { gte: oneMonthAgo };
      }
    }
    if (hasDiscount) {
      where.compareAtPrice = { not: null };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        sectionItems: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
        ...(dto.category && { category: dto.category }),
        ...(dto.brand && { brand: dto.brand }),
        ...(dto.images && { images: dto.images }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.powerConsumption !== undefined && { powerConsumption: dto.powerConsumption }),
        ...(dto.platform !== undefined && { platform: dto.platform || null }),
        ...(dto.socketType !== undefined && { socketType: dto.socketType || null }),
        ...(dto.memoryType !== undefined && { memoryType: dto.memoryType || null }),
        ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
        ...(dto.specifications && { specifications: dto.specifications }),
        ...(dto.sectionIds && {
          sectionItems: {
            deleteMany: {}, // Clear existing assignments provided sectionIds is sent
            create: dto.sectionIds.map(id => ({ section: { connect: { id } } }))
          }
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async updateProductRating(productId: string) {
    const reviews = await this.prisma.review.findMany({ where: { productId } });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await this.prisma.product.update({
      where: { id: productId },
      data: { avgRating, totalReviews: reviews.length },
    });
  }
}

