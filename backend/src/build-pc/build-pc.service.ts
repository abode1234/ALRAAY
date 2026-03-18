import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildPCDto, UpdateBuildPCDto, UpdateBuildComponentDto } from './dto/build-pc.dto';

@Injectable()
export class BuildPCService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, dto: CreateBuildPCDto, isAdmin: boolean = false) {
    // Validate all products exist
    const productIds = dto.components.map(c => c.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    // Check for out-of-stock products
    const outOfStock = products.filter(p => p.stock <= 0);
    if (outOfStock.length > 0) {
      throw new BadRequestException(`Out of stock: ${outOfStock.map(p => p.name).join(', ')}`);
    }

    // Check if template (only admin can create templates)
    if (dto.isTemplate && !isAdmin) {
      throw new ForbiddenException('Only admins can create templates');
    }

    // Calculate totals
    const totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0);
    const totalPower = products.reduce((sum, p) => sum + (p.powerConsumption || 0), 0);

    // Create build
    const buildPC = await this.prisma.build.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        isTemplate: dto.isTemplate || false,
        isPublic: dto.isPublic || false,
        discountAmount: dto.discountAmount ?? null,
        components: {
          create: dto.components.map(comp => ({
            productId: comp.productId,
            category: comp.category,
            quantity: comp.quantity || 1,
          })),
        },
      },
      include: {
        components: { include: { product: true } },
      },
    });

    return buildPC;
  }

  async findAll(userId?: string, templatesOnly: boolean = false) {
    const where: any = {};

    if (templatesOnly) {
      where.isTemplate = true;
    } else if (userId) {
      where.OR = [
        { userId },
        { isPublic: true },
        { isTemplate: true },
      ];
    } else {
      where.OR = [
        { isPublic: true },
        { isTemplate: true },
      ];
    }

    return this.prisma.build.findMany({
      where,
      include: {
        components: { include: { product: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const buildPC = await this.prisma.build.findUnique({
      where: { id },
      include: {
        components: { include: { product: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!buildPC) throw new NotFoundException('Build PC not found');

    // Check access permissions
    if (!buildPC.isPublic && !buildPC.isTemplate && buildPC.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return buildPC;
  }

  async update(id: string, userId: string, dto: UpdateBuildPCDto, isAdmin: boolean = false) {
    const buildPC = await this.findOne(id, userId);

    // Only owner or admin can update
    if (buildPC.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    let totalPrice = 0;
    let totalPower = 0;

    // If components are being updated
    if (dto.components) {
      const productIds = dto.components.map(c => c.productId);
      const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Check for out-of-stock products
      const outOfStock = products.filter(p => p.stock <= 0);
      if (outOfStock.length > 0) {
        throw new BadRequestException(`Out of stock: ${outOfStock.map(p => p.name).join(', ')}`);
      }

      totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0);
      totalPower = products.reduce((sum, p) => sum + (p.powerConsumption || 0), 0);

      // Delete old components and create new ones
      await this.prisma.buildComponent.deleteMany({ where: { buildId: id } });
    } else {
      // Recalculate from existing components
      const existingBuild = await this.prisma.build.findUnique({
        where: { id },
        include: { components: { include: { product: true } } },
      });
      if (existingBuild) {
        totalPrice = existingBuild.components.reduce((sum, c) => sum + Number(c.product.price), 0);
        totalPower = existingBuild.components.reduce((sum, c) => sum + (c.product.powerConsumption || 0), 0);
      }
    }

    return this.prisma.build.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.discountAmount !== undefined && { discountAmount: dto.discountAmount }),
        ...(dto.components && {
          components: {
            create: dto.components.map(comp => ({
              productId: comp.productId,
              category: comp.category,
              quantity: comp.quantity || 1,
            })),
          },
        }),
      },
      include: {
        components: { include: { product: true } },
      },
    });
  }

  async updateComponent(buildId: string, userId: string, dto: UpdateBuildComponentDto & { quantity?: number }) {
    const buildPC = await this.findOne(buildId, userId);

    if (buildPC.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Find existing component by productId
    const existingComponent = await this.prisma.buildComponent.findUnique({
      where: { buildId_productId: { buildId, productId: dto.productId } },
      include: { product: true },
    });

    if (existingComponent) {
      // Update existing component quantity
      await this.prisma.buildComponent.update({
        where: { id: existingComponent.id },
        data: { quantity: dto.quantity || existingComponent.quantity },
      });
    } else {
      // Add new component
      await this.prisma.buildComponent.create({
        data: {
          buildId,
          productId: dto.productId,
          category: dto.category as any,
          quantity: dto.quantity || 1,
        },
      });
    }

    return this.findOne(buildId, userId);
  }

  async removeComponent(buildId: string, productId: string, userId: string) {
    const buildPC = await this.findOne(buildId, userId);

    if (buildPC.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const component = await this.prisma.buildComponent.findUnique({
      where: { buildId_productId: { buildId, productId } },
      include: { product: true },
    });

    if (!component) throw new NotFoundException('Component not found');

    await this.prisma.buildComponent.delete({ where: { id: component.id } });

    return { message: 'Component removed' };
  }

  async delete(id: string, userId: string, isAdmin: boolean = false) {
    const buildPC = await this.findOne(id, userId);

    if (buildPC.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.build.delete({ where: { id } });
    return { message: 'Build PC deleted' };
  }

  async calculatePowerSupply(buildId: string, userId?: string) {
    const buildPC = await this.findOne(buildId, userId);

    // Calculate total power from components
    const totalPower = buildPC.components.reduce(
      (sum, c) => sum + (c.product.powerConsumption || 0),
      0
    );

    // Recommended PSU is total power + 30% headroom
    const recommendedWattage = Math.ceil(totalPower * 1.3);

    // Suggest PSU rating based on wattage
    let rating = '80+ Bronze';
    if (recommendedWattage > 600) rating = '80+ Gold';
    if (recommendedWattage > 800) rating = '80+ Platinum';
    if (recommendedWattage > 1000) rating = '80+ Titanium';

    return {
      totalPower,
      recommendedWattage,
      rating,
      message: `Recommended PSU: ${recommendedWattage}W ${rating} or higher`,
    };
  }
}

