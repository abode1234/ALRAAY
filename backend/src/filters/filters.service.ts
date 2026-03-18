import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FiltersService {
    constructor(private prisma: PrismaService) { }

    async getFilters() {
        // Get active brands
        const brands = await this.prisma.brand.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                nameAr: true,
                slug: true,
                logo: true,
            },
        });

        // Get price range from products
        const priceStats = await this.prisma.product.aggregate({
            _min: { price: true },
            _max: { price: true },
        });

        // Categories from DisplayCategory (dynamic)
        const displayCategories = await this.prisma.displayCategory.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                slug: true,
                name: true,
                nameAr: true,
            },
        });

        const categories = displayCategories.map(cat => ({
            id: cat.slug,
            name: cat.nameAr || cat.name,
            nameEn: cat.name,
        }));

        // Get distinct product prices sorted
        const products = await this.prisma.product.findMany({
            where: { category: { not: 'service' } },
            select: { price: true },
            orderBy: { price: 'asc' },
        });
        const prices = [...new Set(products.map(p => Number(p.price)))].sort((a, b) => a - b);

        return {
            brands,
            categories,
            prices,
            priceRange: {
                min: priceStats._min.price ? Number(priceStats._min.price) : 0,
                max: priceStats._max.price ? Number(priceStats._max.price) : 10000000,
            },
        };
    }
}
