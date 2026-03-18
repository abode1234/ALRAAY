import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateDisplayCategoryDto {
  @IsString()
  name: string;

  @IsString()
  nameAr: string;

  @IsString()
  slug: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  backendCategory?: string;
}

export class UpdateDisplayCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  backendCategory?: string;
}

