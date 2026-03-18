import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymantsService } from './paymants.service';
import { CreatePaymantsDto } from './dto/create-paymant.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('paymants')
export class PaymantsController {
  constructor(private readonly paymantsService: PaymantsService) { }

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  initiatePayment(
    @CurrentUser() user: any,
    @Body() body: CreatePaymantsDto & { orderId: string },
  ) {
    return this.paymantsService.initiatePayment(user.userId, body);
  }

  @Get('retrieve/:sindiPayId')
  @UseGuards(AuthGuard('jwt'))
  retrievePayment(
    @Param('sindiPayId', ParseIntPipe) sindiPayId: number,
    @CurrentUser() user: any,
  ) {
    return this.paymantsService.retrievePayment(sindiPayId, user.userId);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.paymantsService.handleWebhook(body);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  getUserPayments(@CurrentUser() user: any) {
    return this.paymantsService.getUserPayments(user.userId);
  }

  @Get('status/:sindiPayId')
  async getPaymentStatus(
    @Param('sindiPayId', ParseIntPipe) sindiPayId: number,
  ) {
    return this.paymantsService.getPaymentStatus(sindiPayId);
  }
}
