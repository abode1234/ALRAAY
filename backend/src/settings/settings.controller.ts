import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../generated/prisma/client';
import { ForbiddenException } from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  updateSettings(@CurrentUser() user: any, @Body() body: { buildDiscount?: number | null }) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException();
    return this.settingsService.updateSettings(body);
  }
}
