import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatbotService {
    constructor(private prisma: PrismaService) { }

    async getData() {
        const [products, brands, displayCategories, publicBuilds] = await Promise.all([
            this.prisma.product.findMany({
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    compareAtPrice: true,
                    brand: true,
                    category: true,
                    stock: true,
                    specifications: true,
                    powerConsumption: true,
                    avgRating: true,
                    totalReviews: true,
                    isNewArrival: true,
                    images: true,
                },
            }),

            this.prisma.brand.findMany({
                where: { isActive: true },
                select: {
                    name: true,
                    nameAr: true,
                    slug: true,
                    categories: true,
                },
                orderBy: { name: 'asc' },
            }),

            this.prisma.displayCategory.findMany({
                where: { isActive: true },
                select: {
                    name: true,
                    nameAr: true,
                    slug: true,
                },
                orderBy: { order: 'asc' },
            }),

            this.prisma.build.findMany({
                where: { isPublic: true },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    isTemplate: true,
                    components: {
                        select: {
                            category: true,
                            quantity: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    brand: true,
                                    category: true,
                                    price: true,
                                    specifications: true,
                                    powerConsumption: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            products,
            brands,
            categories: displayCategories,
            publicBuilds,
            meta: {
                totalProducts: products.length,
                totalBrands: brands.length,
                totalCategories: displayCategories.length,
                totalPublicBuilds: publicBuilds.length,
            },
        };
    }
}
