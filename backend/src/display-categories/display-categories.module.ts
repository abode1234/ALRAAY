import { Module } from '@nestjs/common';
import { DisplayCategoriesController } from './display-categories.controller';
import { DisplayCategoriesService } from './display-categories.service';

@Module({
  controllers: [DisplayCategoriesController],
  providers: [DisplayCategoriesService],
  exports: [DisplayCategoriesService],
})
export class DisplayCategoriesModule {}
