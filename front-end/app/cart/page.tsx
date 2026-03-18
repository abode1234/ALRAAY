'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, X, MapPin, Phone, CreditCard, Banknote, Loader2, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

type CartItem = {
  id: string;
  quantity: number;
  customPrice?: number;
  product: {
    id: string;
    name: string;
    price: number;
    brand: string;
    images: string[];
  };
};

import AuthModal from '@/components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    street: '',
    city: '',
    state: '',
    phone: '',
  });
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discountType: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCartItems(data.items || []);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceWithCurrency = (price: number) => formatPrice(price) + ' د.ع';

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.customPrice || item.product.price) * item.quantity, 0);
  };

  const getDeliveryCost = () => {
    if (!orderForm.city) return 0;
    return orderForm.city === 'بغداد' ? 5000 : 10000;
  };

  const getDiscountAmount = () => {
    return appliedCoupon ? appliedCoupon.discountAmount : 0;
  };

  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const delivery = getDeliveryCost();
    // Ensure total isn't negative
    return Math.max(subtotal - discount + delivery, 0);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('الرجاء إدخال رمز كود الخصم');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await api.validateCoupon(couponCode.trim().toUpperCase(), cartItems);
      if (response.isValid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountAmount: response.discountAmount,
          discountType: response.discountType,
        });
        toast.success('تم تطبيق كود الخصم بنجاح');
      } else {
        setCouponError(response.message || 'كود الخصم غير صالح أو لا ينطبق على هذه المنتجات');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      setCouponError(error.message || 'حدث خطأ أثناء التحقق من الكود');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Use cart item ID (item.id) not product ID
  const handleIncrement = async (cartItemId: string, currentQuantity: number) => {
    setUpdating(cartItemId);
    try {
      await api.updateCartItem(cartItemId, currentQuantity + 1);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('فشل تحديث الكمية');
    } finally {
      setUpdating(null);
    }
  };

  const handleDecrement = async (cartItemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      await handleRemove(cartItemId);
      return;
    }
    setUpdating(cartItemId);
    try {
      await api.updateCartItem(cartItemId, currentQuantity - 1);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('فشل تحديث الكمية');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    setUpdating(cartItemId);
    try {
      await api.removeFromCart(cartItemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('فشل حذف المنتج');
    } finally {
      setUpdating(null);
    }
  };

  const openCheckoutModal = () => {
    if (api.isLoggedIn()) {
      setShowCheckoutModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    // Validate form only — do NOT create order yet
    if (!orderForm.street.trim()) {
      toast.error('الرجاء إدخال العنوان');
      return;
    }
    if (!orderForm.city.trim()) {
      toast.error('الرجاء إدخال المدينة');
      return;
    }
    if (!orderForm.phone.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!/^07[3-9][0-9]{8}$/.test(orderForm.phone)) {
      toast.error('رقم الهاتف غير صحيح');
      return;
    }

    // Move to payment method selection (no order created yet)
    setCheckoutStep(2);
  };

  const createOrderIfNeeded = async (paymentMethod: 'SINDIPAY' | 'COD') => {
    if (createdOrder) return createdOrder;

    const order: any = await api.createOrder({
      street: orderForm.street,
      city: orderForm.city,
      state: orderForm.state || orderForm.city,
      zipCode: '00000',
      country: 'العراق',
      phone: orderForm.phone,
    }, paymentMethod, appliedCoupon?.code);
    setCreatedOrder(order);
    return order;
  };

  const handleOnlinePayment = async () => {
    setInitiatingPayment(true);
    try {
      const order = await createOrderIfNeeded('SINDIPAY');
      const result = await api.initiatePayment({
        orderId: order.id,
        order_id: order.id,
        title: 'طلب من متجر الرأي',
        total_amount: getTotalPrice(),
        currency: 'IQD',
        locale: 'ar',
        callback_url: `${window.location.origin}/payment-callback`,
      });
      window.location.href = result.redirectUrl;
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error('يجب تسجيل الدخول أولاً');
        setShowCheckoutModal(false);
        router.push('/account');
      } else {
        toast.error('فشل عملية الدفع الإلكتروني: ' + error.message);
      }
      setInitiatingPayment(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setCheckingOut(true);
    try {
      await createOrderIfNeeded('COD');
      setShowCheckoutModal(false);
      setCheckoutStep(1);
      setCreatedOrder(null);
      toast.success('تم إنشاء الطلب بنجاح!');
      router.push('/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error('يجب تسجيل الدخول أولاً');
        setShowCheckoutModal(false);
        router.push('/account');
      } else {
        toast.error('فشل إنشاء الطلب: ' + error.message);
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setCreatedOrder(null);
    setInitiatingPayment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-4">سلة التسوق فارغة!</h2>
            <p className="text-muted-foreground mb-8">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-md p-4 flex items-center gap-4"
                >
                  {item.product.images?.length > 0 && item.product.images[0] && (
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.product.brand}</p>
                    <p className="text-primary font-bold">{formatPriceWithCurrency(item.customPrice || item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(item.id, item.quantity)}
                      disabled={updating === item.id}
                      className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrement(item.id, item.quantity)}
                      disabled={updating === item.id}
                      className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updating === item.id}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div className="bg-card border border-border rounded-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold">{formatPriceWithCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التوصيل</span>
                    <span className="font-bold">
                      {orderForm.city
                        ? formatPriceWithCurrency(getDeliveryCost())
                        : 'يحدد عند اختيار المدينة'}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم ({appliedCoupon.code})</span>
                      <span className="font-bold">
                        -{formatPriceWithCurrency(appliedCoupon.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    بغداد: {formatPriceWithCurrency(5000)} | المحافظات: {formatPriceWithCurrency(10000)}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg">
                    <span className="font-bold">الإجمالي</span>
                    <span className="font-bold text-primary">{formatPriceWithCurrency(getTotalPrice())}</span>
                  </div>
                </div>

                {/* Coupon component inline */}
                <div className="mb-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    لديك كود خصم؟
                  </h3>
                  {!appliedCoupon ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="أدخل رمز الكوبون"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase bg-background"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {validatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تطبيق'}
                        </button>
                      </div>
                      {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm">تم تطبيق الكود: {appliedCoupon.code}</p>
                          <p className="text-xs mt-0.5">خصم بقيمة {formatPriceWithCurrency(appliedCoupon.discountAmount)}</p>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-green-700 hover:text-green-800 p-1">
                          <X className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={openCheckoutModal}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  إتمام الطلب
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-md p-6 max-w-md w-full shadow-md">
              {checkoutStep === 1 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">معلومات التوصيل</h3>
                    <button
                      onClick={closeCheckoutModal}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Phone className="h-4 w-4 inline-block ml-2" />
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        placeholder="07xxxxxxxxx"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right"
                        dir="ltr"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <MapPin className="h-4 w-4 inline-block ml-2" />
                        المدينة
                      </label>
                      <select
                        value={orderForm.city}
                        onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value, state: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">اختر المدينة</option>
                        <option value="بغداد">بغداد</option>
                        <option value="البصرة">البصرة</option>
                        <option value="أربيل">أربيل</option>
                        <option value="الموصل">الموصل</option>
                        <option value="النجف">النجف</option>
                        <option value="كربلاء">كربلاء</option>
                        <option value="السليمانية">السليمانية</option>
                        <option value="كركوك">كركوك</option>
                        <option value="الأنبار">الأنبار</option>
                        <option value="ديالى">ديالى</option>
                        <option value="واسط">واسط</option>
                        <option value="ميسان">ميسان</option>
                        <option value="ذي قار">ذي قار</option>
                        <option value="المثنى">المثنى</option>
                        <option value="القادسية">القادسية</option>
                        <option value="بابل">بابل</option>
                        <option value="صلاح الدين">صلاح الدين</option>
                        <option value="دهوك">دهوك</option>
                      </select>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        العنوان التفصيلي
                      </label>
                      <textarea
                        placeholder="المنطقة، الشارع، أقرب نقطة دالة..."
                        value={orderForm.street}
                        onChange={(e) => setOrderForm({ ...orderForm, street: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-accent/50 rounded-lg p-4 mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span className="font-bold">{formatPriceWithCurrency(getSubtotal())}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">التوصيل</span>
                        <span className="font-bold">
                          {orderForm.city
                            ? formatPriceWithCurrency(getDeliveryCost())
                            : 'اختر المدينة'}
                        </span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>الخصم ({appliedCoupon.code})</span>
                          <span className="font-bold">
                            -{formatPriceWithCurrency(appliedCoupon.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between text-lg">
                        <span className="font-bold">الإجمالي</span>
                        <span className="font-bold text-primary">{formatPriceWithCurrency(getTotalPrice())}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-4"
                    >
                      اختيار طريقة الدفع
                    </button>
                  </div>
                </>
              )}

              {checkoutStep === 2 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">اختر طريقة الدفع</h3>
                    <button
                      onClick={closeCheckoutModal}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-lg font-semibold">
                      المجموع: <span className="text-primary">{formatPriceWithCurrency(getTotalPrice())}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Online Payment */}
                    <button
                      onClick={handleOnlinePayment}
                      disabled={initiatingPayment}
                      className="w-full bg-card border-2 border-primary rounded-md p-4 text-right hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {initiatingPayment ? (
                          <Loader2 className="h-6 w-6 text-primary animate-spin flex-shrink-0" />
                        ) : (
                          <CreditCard className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-base">الدفع الإلكتروني عبر SindiPay</p>
                          <p className="text-sm text-muted-foreground mt-1">آمن ومشفر &bull; فيزا / ماستر كارد</p>
                        </div>
                      </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      onClick={handleCashOnDelivery}
                      disabled={initiatingPayment || checkingOut}
                      className="w-full bg-card border border-border rounded-md p-4 text-right hover:bg-accent/50 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {checkingOut ? (
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin flex-shrink-0" />
                        ) : (
                          <Banknote className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-base">الدفع عند الاستلام</p>
                          <p className="text-sm text-muted-foreground mt-1">ادفع نقداً عند استلام الطلب</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
