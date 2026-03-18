'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    brand: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  AWAITING_PAYMENT: { label: 'في انتظار الدفع', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
  PROCESSING: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  SHIPPED: { label: 'تم الشحن', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Truck },
  DELIVERED: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        router.push('/account');
      } else {
        setError('فشل تحميل الطلبات');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPriceWithCurrency = (price: number) => formatPrice(price) + ' د.ع';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status] || statusMap.PENDING;
    const Icon = statusInfo.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
        <Icon className="h-4 w-4" />
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">طلباتي</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">لا توجد طلبات</h2>
              <p className="text-muted-foreground mb-6">لم تقم بإنشاء أي طلبات بعد</p>
              <button
                onClick={() => router.push('/products')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                تصفح المنتجات
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">طلب #{order.orderNumber}</CardTitle>
                      <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">المنتجات:</h3>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <div className="w-16 h-16 bg-background rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0] || '/placeholder.png'}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold">{formatPriceWithCurrency(Number(item.price))}</p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="p-3 bg-secondary rounded-lg">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">عنوان التوصيل:</h3>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        {order.shippingAddress && (
                          <p>
                            {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state}, {order.shippingAddress.country}
                          </p>
                        )}
                        {order.shippingAddress?.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{order.shippingAddress.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.trackingNumber && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">رقم التتبع:</span> {order.trackingNumber}
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">المجموع الكلي:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPriceWithCurrency(Number(order.totalAmount))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
