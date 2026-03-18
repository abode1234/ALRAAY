import { IsString, IsObject, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsObject()
  @IsNotEmpty()
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SINDIPAY', 'COD'])
  paymentMethod?: 'SINDIPAY' | 'COD';
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

