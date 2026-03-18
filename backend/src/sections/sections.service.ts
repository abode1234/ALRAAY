import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateSectionDto) {
        return this.prisma.section.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.section.findMany({
            orderBy: { order: 'asc' },
            include: {
                items: {
                    where: {
                        OR: [
                            { product: { stock: { gt: 0 } } },
                            { product: null }, // keep build-only items
                        ],
                    },
                    orderBy: { order: 'asc' },
                    include: {
                        product: {
                            include: { productImages: { include: { image: true }, orderBy: { order: 'asc' }, take: 1 } }
                        },
                        build: true, // simplified for now
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const section = await this.prisma.section.findUnique({
            where: { id },
            include: {
                items: {
                    where: {
                        OR: [
                            { product: { stock: { gt: 0 } } },
                            { product: null }, // keep build-only items
                        ],
                    },
                    orderBy: { order: 'asc' },
                    include: {
                        product: true,
                        build: true,
                    },
                },
            },
        });
        if (!section) throw new NotFoundException('Section not found');
        return section;
    }

    async update(id: string, dto: UpdateSectionDto) {
        await this.findOne(id);
        return this.prisma.section.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.section.delete({ where: { id } });
    }
}
