import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.brand.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.brand.findUnique({
            where: { id },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.brand.findUnique({
            where: { slug },
        });
    }

    async findByCategory(category: string) {
        // First try exact match, then try case-insensitive by fetching all active brands
        const exactMatch = await this.prisma.brand.findMany({
            where: {
                isActive: true,
                categories: { has: category },
            },
            orderBy: { name: 'asc' },
        });

        if (exactMatch.length > 0) return exactMatch;

        // Fallback: case-insensitive match on categories array
        const allBrands = await this.prisma.brand.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });

        const lowerCategory = category.toLowerCase();
        return allBrands.filter(brand =>
            brand.categories.some(cat => cat.toLowerCase() === lowerCategory)
        );
    }

    async create(data: {
        name: string;
        nameAr?: string;
        logo?: string;
        slug: string;
        categories?: string[];
    }) {
        return this.prisma.brand.create({
            data,
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            nameAr?: string;
            logo?: string;
            slug?: string;
            categories?: string[];
            isActive?: boolean;
        },
    ) {
        return this.prisma.brand.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.brand.delete({
            where: { id },
        });
    }
}
