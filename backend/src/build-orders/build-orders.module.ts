import { Module } from '@nestjs/common';
import { BuildOrdersService } from './build-orders.service';
import { BuildOrdersController, AdminBuildOrdersController } from './build-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [BuildOrdersController, AdminBuildOrdersController],
    providers: [BuildOrdersService],
    exports: [BuildOrdersService],
})
export class BuildOrdersModule { }
