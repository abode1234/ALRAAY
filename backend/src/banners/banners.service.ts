import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { BannerPosition } from '../../generated/prisma';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        link: dto.link,
        position: dto.position ?? 'MAIN_SLIDER',
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  async findAll(includeInactive = false, position?: BannerPosition) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (position) {
      where.position = position;
    }
    return this.prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.banner.delete({
      where: { id },
    });
  }

  async getActiveBanners(position?: BannerPosition) {
    const where: any = { isActive: true };
    if (position) {
      where.position = position;
    }
    return this.prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async getMainSliderBanners() {
    return this.getActiveBanners('MAIN_SLIDER');
  }

  async getSecondaryTopBanner() {
    const banners = await this.getActiveBanners('SECONDARY_TOP');
    return banners[0] || null;
  }

  async getSecondaryBottomBanner() {
    const banners = await this.getActiveBanners('SECONDARY_BOTTOM');
    return banners[0] || null;
  }
}
