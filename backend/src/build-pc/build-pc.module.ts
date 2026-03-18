import { Module } from '@nestjs/common';
import { BuildPCController } from './build-pc.controller';
import { BuildPCService } from './build-pc.service';

@Module({
  controllers: [BuildPCController],
  providers: [BuildPCService],
  exports: [BuildPCService],
})
export class BuildPCModule {}

