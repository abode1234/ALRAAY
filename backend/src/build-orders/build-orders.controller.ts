import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BuildOrdersService } from './build-orders.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BuildOrderStatus } from '../../generated/prisma';

// Public endpoint for users to submit orders
@Controller('build-orders')
export class BuildOrdersController {
    constructor(private readonly buildOrdersService: BuildOrdersService) { }

    @Post()
    async create(
        @Body()
        data: {
            customerPhone: string;
            customerName?: string;
            customerAddress: string;
            notes?: string;
            totalAmount: number;
            components: any;
        },
    ) {
        return this.buildOrdersService.create(data);
    }

    @Get('track/:orderNumber')
    async trackOrder(@Param('orderNumber') orderNumber: string) {
        const order = await this.buildOrdersService.findByOrderNumber(orderNumber);
        if (!order) {
            return { error: 'Order not found' };
        }
        return {
            orderNumber: order.orderNumber,
            status: order.status,
            createdAt: order.createdAt,
        };
    }
}

// Admin endpoints for managing orders
@Controller('admin/build-orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminBuildOrdersController {
    constructor(private readonly buildOrdersService: BuildOrdersService) { }

    @Get()
    async findAll(@Query('status') status?: BuildOrderStatus) {
        return this.buildOrdersService.findAll(status);
    }

    @Get('stats')
    async getStats() {
        return this.buildOrdersService.getStats();
    }

    @Get('new-count')
    async getNewOrdersCount() {
        const count = await this.buildOrdersService.getNewOrdersCount();
        return { count };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.buildOrdersService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: BuildOrderStatus,
    ) {
        return this.buildOrdersService.updateStatus(id, status);
    }
}
