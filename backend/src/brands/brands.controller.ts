import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async findAll() {
        return this.brandsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.brandsService.findOne(id);
    }

    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.brandsService.findBySlug(slug);
    }

    @Get('category/:category')
    async findByCategory(@Param('category') category: string) {
        return this.brandsService.findByCategory(category as any);
    }
}

@Controller('admin/brands')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminBrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async findAll() {
        return this.brandsService.findAll();
    }

    @Post()
    async create(
        @Body()
        data: {
            name: string;
            nameAr?: string;
            logo?: string;
            slug: string;
        },
    ) {
        return this.brandsService.create(data);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body()
        data: {
            name?: string;
            nameAr?: string;
            logo?: string;
            slug?: string;
            isActive?: boolean;
        },
    ) {
        return this.brandsService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.brandsService.delete(id);
    }
}
