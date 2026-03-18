import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsObject,
  IsNumber,
  Min,
} from 'class-validator';

export class CreatePaymantsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  total_amount: number;

  @IsOptional()
  @IsString()
  currency?: 'IQD';

  @IsOptional()
  @IsString()
  locale?: 'en' | 'ar';

  @IsNotEmpty()
  @IsUrl()
  callback_url: string;

  @IsOptional()
  @IsUrl()
  webhook_url?: string;

  @IsOptional()
  @IsObject()
  meta_data?: Record<string, any>;
}
