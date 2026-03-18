import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DisplayCategoriesService } from './display-categories.service';
import { CreateDisplayCategoryDto, UpdateDisplayCategoryDto } from './dto/display-category.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('display-categories')
export class DisplayCategoriesController {
  constructor(private readonly displayCategoriesService: DisplayCategoriesService) {}

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.displayCategoriesService.findAll(includeInactive === 'true');
  }

  @Get('active')
  async getActiveCategories() {
    return this.displayCategoriesService.getActiveCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.displayCategoriesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreateDisplayCategoryDto) {
    return this.displayCategoriesService.create(createDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDisplayCategoryDto,
  ) {
    return this.displayCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.displayCategoriesService.remove(id);
  }
}
