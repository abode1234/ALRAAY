import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SectionType } from '../../../generated/prisma/client';

export class CreateSectionDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    titleAr?: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsEnum(SectionType)
    type?: SectionType;

    @IsOptional()
    @IsNumber()
    order?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateSectionDto extends CreateSectionDto { }
