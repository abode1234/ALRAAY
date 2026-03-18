import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({ data: { id: 'main' } });
    }
    return settings;
  }

  async updateSettings(data: { buildDiscount?: number | null }) {
    return this.prisma.siteSettings.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...data },
      update: data,
    });
  }
}
