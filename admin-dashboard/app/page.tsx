'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Tags,
  Image as ImageIcon,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { adminApi } from '@/lib/api';

interface Stats {
  products: number;
  brands: number;
  banners: number;
  newOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerPhone?: string;
  customerName?: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  hasOnlinePayment: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all stats
        const [products, brands, banners, generalStats, orders] = await Promise.all([
          adminApi.getProducts({ limit: 1 }),
          adminApi.getBrands(),
          adminApi.getBanners(),
          adminApi.getStats(), // This returns { totalProducts, totalOrders, pendingOrders, ... }
          adminApi.getOrders(''), // Fetch regular orders
        ]);

        setStats({
          products: (products as any).meta?.total || 0,
          brands: brands.length,
          banners: banners.length,
          newOrders: (generalStats as any).pendingOrders || 0,
        });

        // Format recent orders
        const formattedOrders = orders.slice(0, 5).map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          customerPhone: order.shippingAddress?.phone || 'N/A',
          customerName: order.user?.name || 'Guest',
          hasOnlinePayment: order.payments && order.payments.length > 0,
        }));

        setRecentOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'المنتجات',
      value: stats?.products || 0,
      icon: Package,
      color: 'bg-teal-500',
      href: '/products',
    },
    {
      title: 'البراندات',
      value: stats?.brands || 0,
      icon: Tags,
      color: 'bg-teal-500',
      href: '/brands',
    },
    {
      title: 'البانرات',
      value: stats?.banners || 0,
      icon: ImageIcon,
      color: 'bg-cyan-500',
      href: '/banners',
    },
    {
      title: 'الطلبات الجديدة',
      value: stats?.newOrders || 0,
      icon: ShoppingCart,
      color: 'bg-emerald-600',
      href: '/orders/regular', // Pointing to regular orders page
      highlight: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      PROCESSING: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700', icon: Package },
      SHIPPED: { label: 'تم الشحن', color: 'bg-teal-100 text-teal-700', icon: Package },
      DELIVERED: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
    };

    const { label, color, icon: Icon } = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 mr-64">
          <Header title="الرئيسية" />
          <div className="p-6 flex items-center justify-center h-96">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">
      <Sidebar />
      <main className="flex-1 mr-64">
        <Header title="الرئيسية" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`bg-white rounded-md p-6 border border-gray-200 hover:border-gray-300 transition-colors ${card.highlight && card.value > 0 ? 'ring-1 ring-emerald-500' : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-md flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {card.highlight && card.value > 0 && (
                    <p className="text-emerald-600 text-sm mt-2 font-medium animate-pulse">
                      🔔 لديك طلبات جديدة!
                    </p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-md border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">آخر الطلبات</h2>
              <Link
                href="/orders/regular"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                عرض الكل
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد طلبات حتى الآن</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href="/orders/regular"
                    className="flex items-center justify-between p-4 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {order.hasOnlinePayment ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <CreditCard className="h-3 w-3" />
                            بطاقة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <Banknote className="h-3 w-3" />
                            نقدي
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {Number(order.totalAmount).toLocaleString('ar-IQ')} د.ع
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
