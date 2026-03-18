import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Check if product exists
    await this.productsService.findOne(dto.productId);

    // Check if user has purchased this product
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException('You can only review products you have purchased');
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Update product rating
    await this.productsService.updateProductRating(dto.productId);

    return review;
  }

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    await this.productsService.updateProductRating(review.productId);
    return updated;
  }

  async delete(id: string, userId: string, isAdmin: boolean = false) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && !isAdmin) throw new ForbiddenException('Access denied');

    await this.prisma.review.delete({ where: { id } });
    await this.productsService.updateProductRating(review.productId);
    return { message: 'Review deleted' };
  }
}

