export interface CreatePaymentDto {
  title: string;
  order_id: string;
  total_amount: number;
  currency?: 'IQD';
  locale?: 'en' | 'ar';
  callback_url: string;
  webhook_url?: string;
  meta_data?: Record<string, any>;
}
