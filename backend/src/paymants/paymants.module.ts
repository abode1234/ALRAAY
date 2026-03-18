import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PaymantsService } from './paymants.service';
import { PaymantsController } from './paymants.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PaymantsController],
  providers: [PaymantsService],
  exports: [PaymantsService],
})
export class PaymantsModule {}
