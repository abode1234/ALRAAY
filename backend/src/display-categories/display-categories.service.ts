import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisplayCategoryDto, UpdateDisplayCategoryDto } from './dto/display-category.dto';

@Injectable()
export class DisplayCategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateDisplayCategoryDto) {
    return this.prisma.displayCategory.create({
      data: {
        name: dto.name,
        nameAr: dto.nameAr,
        slug: dto.slug,
        icon: dto.icon,
        link: dto.link,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    return this.prisma.displayCategory.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.displayCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Display category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateDisplayCategoryDto) {
    await this.findOne(id);

    return this.prisma.displayCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.displayCategory.delete({
      where: { id },
    });
  }

  async getActiveCategories() {
    return this.prisma.displayCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}
