'use client';

import { useEffect, useState } from 'react';
import {
    ShoppingCart,
    Phone,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    AlertCircle,
    Eye,
    X,
    Truck,
    MessageCircle,
    CreditCard,
    Banknote,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { adminApi } from '@/lib/api';

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
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
    totalAmount: string;
    status: string;
    shippingAddress: any;
    trackingNumber?: string;
    createdAt: string;
    items: OrderItem[];
    user: {
        id: string;
        name: string;
        email: string;
    };
    payments?: Array<{
        id: string;
        status: string;
        sindiPayId?: number;
    }>;
}

const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'PENDING', label: 'قيد الانتظار' },
    { value: 'PROCESSING', label: 'قيد المعالجة' },
    { value: 'SHIPPED', label: 'تم الشحن' },
    { value: 'DELIVERED', label: 'تم التوصيل' },
    { value: 'CANCELLED', label: 'ملغي' },
];

export default function RegularOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchOrders = async () => {
        try {
            console.log('🔍 Fetching orders with status:', filterStatus || 'all');
            const data = await adminApi.getOrders(filterStatus || undefined);
            console.log('✅ Orders fetched successfully:', data);
            console.log('📊 Number of orders:', data?.length || 0);
            setOrders(data);
        } catch (error: any) {
            console.error('❌ Error fetching orders:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error);
            alert(`خطأ في تحميل الطلبات: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdating(true);
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            await fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string; icon: any }> = {
            PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            PROCESSING: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
            SHIPPED: { label: 'تم الشحن', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Truck },
            DELIVERED: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
            CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        };

        const { label, color, icon: Icon } = statusMap[status] || statusMap.PENDING;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}>
                <Icon className="h-4 w-4" />
                {label}
            </span>
        );
    };

    const getPaymentBadge = (order: Order) => {
        const hasOnlinePayment = order.payments && order.payments.length > 0;
        if (hasOnlinePayment) {
            const payment = order.payments![0];
            const isPaid = payment.status === 'PAID';
            return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${isPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                    <CreditCard className="h-4 w-4" />
                    {isPaid ? 'مدفوع إلكترونياً' : 'دفع إلكتروني'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-orange-100 text-orange-700 border-orange-200">
                <Banknote className="h-4 w-4" />
                دفع عند الاستلام
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openWhatsApp = (phone: string, orderNumber: string) => {
        if (!phone) return;

        // Sanitize phone number
        let safePhone = phone.replace(/[^0-9]/g, '');

        // Remove leading zero if present
        if (safePhone.startsWith('0')) {
            safePhone = safePhone.substring(1);
        }

        // Add 964 if not present
        if (!safePhone.startsWith('964')) {
            safePhone = '964' + safePhone;
        }

        const message = `مرحباً، بخصوص طلبك رقم ${orderNumber}`;
        window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="طلبات السلة" />
                    <div className="p-6 flex items-center justify-center h-96">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64">
                <Header title="طلبات السلة" />

                <div className="p-6">
                    {/* Filter */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <label className="font-medium text-gray-700">فلترة حسب الحالة:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد طلبات</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-xl shadow-sm overflow-hidden ${order.status === 'PENDING' ? 'ring-2 ring-emerald-600' : ''
                                        }`}
                                >
                                    {/* Order Header */}
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'PENDING' ? 'bg-emerald-100' : 'bg-gray-100'
                                                }`}>
                                                <ShoppingCart className={`h-6 w-6 ${order.status === 'PENDING' ? 'text-emerald-600' : 'text-gray-500'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">{order.orderNumber}</p>
                                                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getPaymentBadge(order)}
                                            {getStatusBadge(order.status)}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="h-5 w-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Body */}
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Customer Info */}
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">معلومات العميل:</p>
                                            <p className="font-medium">{order.user.name}</p>
                                            <p className="text-gray-600 text-sm">{order.user.email}</p>
                                            {order.shippingAddress?.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="font-medium">{order.shippingAddress.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    {order.shippingAddress.street}, {order.shippingAddress.city}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-sm text-gray-500 mb-2">المنتجات ({order.items.reduce((sum, item) => sum + item.quantity, 0)}):</p>
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                                        <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="truncate text-gray-700 font-medium">
                                                            {item.product?.name || 'منتج محذوف'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">المبلغ الإجمالي</p>
                                            <p className="text-xl font-bold text-emerald-600">
                                                {Number(order.totalAmount).toLocaleString('ar-IQ')} د.ع
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2">
                                            {order.shippingAddress?.phone && (
                                                <button
                                                    onClick={() => openWhatsApp(order.shippingAddress.phone, order.orderNumber)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    واتساب
                                                </button>
                                            )}
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                disabled={updating || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                                            >
                                                {statusOptions.slice(1).map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        تغيير إلى {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedOrder.orderNumber}</h2>
                                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">الحالة:</span>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>

                                {/* Payment Method */}
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">طريقة الدفع:</span>
                                    {getPaymentBadge(selectedOrder)}
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <h3 className="font-bold text-gray-800 mb-3">معلومات العميل</h3>
                                    <p><span className="text-gray-600">الاسم:</span> <span className="font-medium">{selectedOrder.user.name}</span></p>
                                    <p><span className="text-gray-600">البريد:</span> <span className="font-medium">{selectedOrder.user.email}</span></p>
                                    {selectedOrder.shippingAddress?.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <span className="font-medium">{selectedOrder.shippingAddress.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <span>
                                            {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                                            {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                                        </span>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-bold text-gray-800 mb-3">المنتجات</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                                <img
                                                    src={item.product.images[0] || '/placeholder.png'}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-contain rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">{item.product.brand}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold">{Number(item.price).toLocaleString('ar-IQ')} د.ع</p>
                                                    <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
                                    <span className="font-bold text-gray-800">المبلغ الإجمالي</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                        {Number(selectedOrder.totalAmount).toLocaleString('ar-IQ')} د.ع
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {selectedOrder.shippingAddress?.phone && (
                                        <button
                                            onClick={() => openWhatsApp(selectedOrder.shippingAddress.phone, selectedOrder.orderNumber)}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            تواصل واتساب
                                        </button>
                                    )}
                                </div>

                                {/* Status Update */}
                                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">تحديث الحالة</label>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                            className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        >
                                            {statusOptions.slice(1).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
