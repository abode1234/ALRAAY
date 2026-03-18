import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto, AddBuildToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.userId, dto);
  }

  @Post('build')
  addBuildToCart(@CurrentUser() user: any, @Body() dto: AddBuildToCartDto) {
    return this.cartService.addBuildToCart(user.userId, dto);
  }

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.userId);
  }

  @Patch(':id')
  updateCartItem(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(user.userId, id, dto);
  }

  @Delete(':id')
  removeFromCart(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(user.userId, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.userId);
  }
}

