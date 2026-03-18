'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'processing';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Method 1: Use payment_id from SindiPay redirect URL (most reliable)
        const paymentIdParam = searchParams.get('payment_id');

        if (paymentIdParam) {
          const sindiPayId = Number(paymentIdParam);
          if (!isNaN(sindiPayId)) {
            try {
              // This calls public backend endpoint which syncs from SindiPay and updates order status
              const result = await api.getPaymentStatus(sindiPayId);
              const paymentStatus = result.status?.toUpperCase();

              if (paymentStatus === 'PAID') {
                setStatus('success');
              } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentStatus)) {
                setStatus('failed');
                if (paymentStatus === 'EXPIRED') {
                  setErrorMessage('انتهت صلاحية عملية الدفع');
                } else if (paymentStatus === 'CANCELLED') {
                  setErrorMessage('تم إلغاء عملية الدفع');
                }
              } else {
                // CREATED or unknown — still processing
                setStatus('processing');
              }
              return;
            } catch (error) {
              console.error('Error retrieving payment from SindiPay:', error);
              // Fall through to Method 2
            }
          }
        }

        // Method 2: Fallback — check via localStorage pending_payment
        const pendingRaw = localStorage.getItem('pending_payment');
        localStorage.removeItem('pending_payment');

        if (!pendingRaw) {
          setStatus('processing');
          return;
        }

        const { orderId } = JSON.parse(pendingRaw);
        if (!orderId) {
          setStatus('processing');
          return;
        }

        const payments: any[] = await api.getUserPayments();
        const payment = payments.find((p: any) => p.orderId === orderId);

        if (!payment) {
          setStatus('processing');
          return;
        }

        const paymentStatus = payment.status?.toUpperCase();

        if (paymentStatus === 'PAID') {
          setStatus('success');
        } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentStatus)) {
          setStatus('failed');
        } else {
          setStatus('processing');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('processing');
      }
    };

    checkPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <p className="text-lg font-semibold">جاري التحقق من حالة الدفع...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">تم الدفع بنجاح!</h2>
            <p className="text-muted-foreground">شكراً لطلبك، سيتم معالجة طلبك قريباً.</p>
            <Link
              href="/orders"
              className="inline-block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-4"
            >
              عرض طلباتي
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <XCircle className="h-20 w-20 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-600">فشلت عملية الدفع</h2>
            <p className="text-muted-foreground">
              {errorMessage || 'يمكنك المحاولة مرة أخرى من صفحة طلباتك.'}
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <Link
                href="/orders"
                className="inline-block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                العودة للطلبات
              </Link>
              <Link
                href="/cart"
                className="inline-block w-full bg-background border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                العودة للسلة
              </Link>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="space-y-4">
            <Clock className="h-20 w-20 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold text-yellow-600">الدفع قيد المعالجة</h2>
            <p className="text-muted-foreground">سيتم تحديث حالة طلبك تلقائياً. يمكنك متابعة طلباتك.</p>
            <Link
              href="/orders"
              className="inline-block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-4"
            >
              عرض طلباتي
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <p className="text-lg font-semibold">جاري التحقق من حالة الدفع...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
