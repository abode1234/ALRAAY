import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNotEmpty, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BuildPCComponentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class CreateBuildPCDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildPCComponentDto)
  components: BuildPCComponentDto[];
}

export class UpdateBuildPCDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildPCComponentDto)
  components?: BuildPCComponentDto[];
}

export class UpdateBuildComponentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  category: string;
}
