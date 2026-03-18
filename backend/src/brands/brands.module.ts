import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController, AdminBrandsController } from './brands.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [BrandsController, AdminBrandsController],
    providers: [BrandsService],
    exports: [BrandsService],
})
export class BrandsModule { }
