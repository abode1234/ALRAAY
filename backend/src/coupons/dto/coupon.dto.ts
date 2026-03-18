import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../../../generated/prisma/client';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  usageLimit?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableProductIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableBuildIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  usageLimit?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableProductIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableBuildIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];
}
