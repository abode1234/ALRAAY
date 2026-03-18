export interface SindiPayPayment {
  id: number;
  title: string;
  order_id: string;
  total_amount: string;
  currency: 'IQD';
  url: string;
  locale: 'en' | 'ar';
  callback_url: string;
  webhook_url?: string;
  meta_data?: any;
  status: 'CREATED' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
}
