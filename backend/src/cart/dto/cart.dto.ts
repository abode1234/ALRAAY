import { IsString, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsOptional()
  components?: any;
}

export class AddBuildToCartDto {
  @IsNotEmpty()
  components: any;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

