import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildOrderStatus } from '../../generated/prisma';

@Injectable()
export class BuildOrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: BuildOrderStatus) {
        return this.prisma.buildOrder.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.buildOrder.findUnique({
            where: { id },
        });
    }

    async findByOrderNumber(orderNumber: string) {
        return this.prisma.buildOrder.findUnique({
            where: { orderNumber },
        });
    }

    async create(data: {
        customerPhone: string;
        customerName?: string;
        customerAddress: string;
        notes?: string;
        totalAmount: number;
        components: any; // JSON object containing build components
    }) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        return this.prisma.buildOrder.create({
            data: {
                ...data,
                orderNumber,
                totalAmount: data.totalAmount,
            },
        });
    }

    async updateStatus(id: string, status: BuildOrderStatus) {
        const buildOrder = await this.prisma.buildOrder.update({
            where: { id },
            data: { status },
        });

        // Sync with parent Order
        // Extract parent order number (format: ORD-XXX-XXX-BUILD-YYY)
        // We assume the part before "-BUILD-" is the parent order number
        if (buildOrder.orderNumber && buildOrder.orderNumber.includes('-BUILD-')) {
            const parentOrderNumber = buildOrder.orderNumber.split('-BUILD-')[0];

            let orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | undefined;

            switch (status) {
                case 'NEW':
                    orderStatus = 'PENDING';
                    break;
                case 'PROCESSING':
                case 'CONFIRMED':
                    orderStatus = 'PROCESSING';
                    break;
                case 'SHIPPED':
                    orderStatus = 'SHIPPED';
                    break;
                case 'DELIVERED':
                    orderStatus = 'DELIVERED';
                    break;
                case 'CANCELLED':
                    orderStatus = 'CANCELLED';
                    break;
            }

            if (orderStatus) {
                await this.prisma.order.update({
                    where: { orderNumber: parentOrderNumber },
                    data: { status: orderStatus },
                }).catch(e => {
                    console.error(`Failed to sync status for order ${parentOrderNumber}:`, e);
                });
            }
        }

        return buildOrder;
    }

    async getNewOrdersCount() {
        return this.prisma.buildOrder.count({
            where: { status: 'NEW' },
        });
    }

    async getStats() {
        const [total, newOrders, processing, confirmed, shipped, delivered, cancelled] = await Promise.all([
            this.prisma.buildOrder.count(),
            this.prisma.buildOrder.count({ where: { status: 'NEW' } }),
            this.prisma.buildOrder.count({ where: { status: 'PROCESSING' } }),
            this.prisma.buildOrder.count({ where: { status: 'CONFIRMED' } }),
            this.prisma.buildOrder.count({ where: { status: 'SHIPPED' } }),
            this.prisma.buildOrder.count({ where: { status: 'DELIVERED' } }),
            this.prisma.buildOrder.count({ where: { status: 'CANCELLED' } }),
        ]);

        return {
            total,
            newOrders,
            processing,
            confirmed,
            shipped,
            delivered,
            cancelled,
        };
    }
}
