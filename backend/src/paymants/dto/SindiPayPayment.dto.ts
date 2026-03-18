import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class SidiPayPaymentDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;
    @IsNotEmpty()
    @IsString()
    title: string;
    @IsNotEmpty()
    @IsString()
    order_id: string;
    @IsNotEmpty()
    @IsNumber()
    total_amount: string;
    @IsNotEmpty()
    @IsString()
    currency: 'IQD';
    @IsNotEmpty()
    @IsString()
    url: string;
    @IsNotEmpty()
    @IsString()
    locale: 'en' | 'ar';
    @IsNotEmpty()
    @IsString()
    callback_url: string;
    @IsString()
    @IsOptional()
    webhook_url?: string;
    @IsObject()
    @IsOptional()
    meta_data?: any;
    @IsNotEmpty()
    @IsString()
    status: 'CREATED' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
}
