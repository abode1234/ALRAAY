import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../generated/prisma/client';
import { BuildPCService } from './build-pc.service';
import { CreateBuildPCDto, UpdateBuildPCDto, UpdateBuildComponentDto } from './dto/build-pc.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('build-pc')
export class BuildPCController {
  constructor(private buildPCService: BuildPCService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: any, @Body() dto: CreateBuildPCDto) {
    return this.buildPCService.create(user.userId, dto, user.role === Role.ADMIN);
  }

  @Get()
  findAll(@Query('templates') templates?: string, @CurrentUser() user?: any) {
    return this.buildPCService.findAll(user?.userId, templates === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.buildPCService.findOne(id, user?.userId);
  }

  @Get(':id/power-calculator')
  calculatePower(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.buildPCService.calculatePowerSupply(id, user?.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateBuildPCDto) {
    return this.buildPCService.update(id, user.userId, dto, user.role === Role.ADMIN);
  }

  @Patch(':id/components')
  @UseGuards(AuthGuard('jwt'))
  updateComponent(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBuildComponentDto & { quantity?: number },
  ) {
    return this.buildPCService.updateComponent(id, user.userId, dto);
  }

  @Delete(':id/components/:productId')
  @UseGuards(AuthGuard('jwt'))
  removeComponent(@Param('id') id: string, @Param('productId') productId: string, @CurrentUser() user: any) {
    return this.buildPCService.removeComponent(id, productId, user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.buildPCService.delete(id, user.userId, user.role === Role.ADMIN);
  }
}

