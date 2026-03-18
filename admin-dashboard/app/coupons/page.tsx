'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Ticket, X, Link2, AlertCircle } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    isActive: boolean;
    expiryDate: string | null;
    usageLimit: number | null;
    usedCount: number;
    applicableProducts?: { id: string; name: string }[];
    applicableBuilds?: any[];
    applicableCategories?: string[];
}

interface SelectedProduct {
    id: string;
    name: string;
    url: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        isActive: true,
        expiryDate: '',
        usageLimit: '',
    });

    // Product URL linking state
    const [productUrlInput, setProductUrlInput] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [urlError, setUrlError] = useState('');
    const [fetchingProduct, setFetchingProduct] = useState(false);

    // Category filter state
    const [availableCategories, setAvailableCategories] = useState<{ slug: string; nameAr: string }[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchCoupons();
        adminApi.getDisplayCategories().then((cats: any[]) => {
            setAvailableCategories(cats.filter(c => c.isActive).map(c => ({ slug: c.slug, nameAr: c.nameAr || c.name })));
        }).catch(() => {});
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            alert('حدث خطأ أثناء جلب أكواد الخصم');
        } finally {
            setLoading(false);
        }
    };

    const extractProductId = (url: string): string | null => {
        // Matches /product/PRODUCT_ID at end of URL (with or without trailing slash)
        const match = url.match(/\/product\/([a-zA-Z0-9_-]+)\/?$/);
        return match ? match[1] : null;
    };

    const handleAddProductUrl = async () => {
        setUrlError('');
        const trimmed = productUrlInput.trim();
        if (!trimmed) return;

        const productId = extractProductId(trimmed);
        if (!productId) {
            setUrlError('رابط غير صحيح. يجب أن يكون بالشكل: /product/ID');
            return;
        }

        if (selectedProducts.some(p => p.id === productId)) {
            setUrlError('هذا المنتج مضاف مسبقاً');
            return;
        }

        setFetchingProduct(true);
        try {
            const product = await adminApi.getProduct(productId);
            setSelectedProducts(prev => [...prev, { id: product.id, name: product.name, url: trimmed }]);
            setProductUrlInput('');
        } catch {
            setUrlError('لم يتم العثور على المنتج. تحقق من الرابط');
        } finally {
            setFetchingProduct(false);
        }
    };

    const removeSelectedProduct = (id: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleOpenModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                isActive: coupon.isActive,
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
            });
            setSelectedProducts(coupon.applicableProducts?.length ? coupon.applicableProducts.map(p => ({
                id: p.id, name: p.name, url: `/product/${p.id}`,
            })) : []);
            setSelectedCategories(coupon.applicableCategories || []);
        } else {
            setEditingCoupon(null);
            setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', isActive: true, expiryDate: '', usageLimit: '' });
            setSelectedProducts([]);
            setSelectedCategories([]);
        }
        setProductUrlInput('');
        setUrlError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                discountValue: Number(formData.discountValue),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
                applicableProductIds: selectedProducts.map(p => p.id),
                applicableCategories: selectedCategories,
            };

            if (editingCoupon) {
                await adminApi.updateCoupon(editingCoupon.id, dataToSubmit);
            } else {
                await adminApi.createCoupon(dataToSubmit);
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            alert(error.message || 'حدث خطأ أثناء حفظ كود الخصم');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف كود الخصم هذا؟')) {
            try {
                await adminApi.deleteCoupon(id);
                fetchCoupons();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                alert('حدث خطأ أثناء حذف كود الخصم');
            }
        }
    };

    const toggleStatus = async (coupon: Coupon) => {
        try {
            await adminApi.updateCoupon(coupon.id, { isActive: !coupon.isActive });
            fetchCoupons();
        } catch (error) {
            console.error('Error toggling coupon status:', error);
            alert('حدث خطأ أثناء تغيير حالة كود الخصم');
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="w-8 h-8 text-emerald-600" />
                        أكواد الخصم
                    </h1>
                    <p className="text-gray-500 mt-1">إدارة أكواد الخصم والعروض الترويجية</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-emerald-200"
                >
                    <Plus className="w-5 h-5" />
                    إضافة كود جديد
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="البحث برمز الكوبون..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-wider text-gray-900">{coupon.code}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {coupon.isActive ? 'نشط' : 'متوقف'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(coupon)}
                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span>قيمة الخصم</span>
                                <span className="font-bold text-gray-900 text-lg">
                                    {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `${coupon.discountValue.toLocaleString()} د.ع`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span>تاريخ الانتهاء</span>
                                <span className="font-medium">
                                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('ar-IQ') : 'لا يوجد'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span>مرات الاستخدام</span>
                                <span className="font-medium text-emerald-600">
                                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(بدون حد)'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span>يطبق على</span>
                                <span className="font-medium text-gray-800 text-left text-xs">
                                    {coupon.applicableCategories && coupon.applicableCategories.length > 0
                                        ? `${coupon.applicableCategories.length} تصنيف`
                                        : coupon.applicableProducts && coupon.applicableProducts.length > 0
                                            ? `${coupon.applicableProducts.length} منتج`
                                            : 'جميع المنتجات'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleStatus(coupon)}
                            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${coupon.isActive
                                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                        >
                            {coupon.isActive ? 'إيقاف الكود' : 'تفعيل الكود'}
                        </button>
                    </div>
                ))}
            </div>

            {filteredCoupons.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">لا يوجد أكواد خصم</h3>
                    <p className="text-gray-500">لم يتم العثور على أي أكواد خصم مطابقة لبحثك.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 sticky top-0 z-10">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingCoupon ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic coupon fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">رمز الكوبون</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase font-medium bg-gray-50"
                                        placeholder="مثال: SAVE2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">نوع الخصم</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50"
                                    >
                                        <option value="PERCENTAGE">نسبة مئوية (%)</option>
                                        <option value="FIXED">مبلغ ثابت (د.ع)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">
                                        قيمة الخصم {formData.discountType === 'PERCENTAGE' ? '(%)' : '(د.ع)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50"
                                        placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '25000'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">تاريخ الانتهاء (اختياري)</label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">حد الاستخدام (اختياري)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="مثال: يتاح لـ 100 مستخدم فقط"
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50"
                                    />
                                </div>

                                <div className="h-full flex items-end pb-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'left-1 translate-x-6' : 'left-1'}`} />
                                        </div>
                                        <span className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                                            تفعيل الكود فور الحفظ
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Category filter section */}
                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        تخصيص الكود لتصنيف واحد فقط (اختياري)
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        إذا اخترت تصنيفاً، يطبق الكود على منتجات ذلك التصنيف فقط.
                                    </p>
                                </div>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !selectedCategories.includes(val)) {
                                            setSelectedCategories(prev => [...prev, val]);
                                        }
                                    }}
                                    className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-sm"
                                >
                                    <option value="">— اختر تصنيف —</option>
                                    {availableCategories
                                        .filter(c => !selectedCategories.includes(c.slug))
                                        .map(c => (
                                            <option key={c.slug} value={c.slug}>{c.nameAr}</option>
                                        ))}
                                </select>
                                {selectedCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCategories.map(slug => {
                                            const cat = availableCategories.find(c => c.slug === slug);
                                            return (
                                                <span key={slug} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-sm px-3 py-1.5 rounded-lg">
                                                    {cat?.nameAr || slug}
                                                    <button type="button" onClick={() => setSelectedCategories(prev => prev.filter(s => s !== slug))} className="hover:text-red-500 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Product URL section */}
                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Link2 className="w-4 h-4 text-emerald-600" />
                                        تخصيص الكود لمنتجات محددة (اختياري)
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        إذا لم تضف منتجات، يطبق الكود على جميع المنتجات. الصق رابط المنتج من الموقع للإضافة.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={productUrlInput}
                                        onChange={(e) => { setProductUrlInput(e.target.value); setUrlError(''); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProductUrl(); } }}
                                        placeholder="مثال: https://alatian.com/product/abc123"
                                        className="flex-1 p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 text-sm"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddProductUrl}
                                        disabled={fetchingProduct || !productUrlInput.trim()}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                                    >
                                        {fetchingProduct ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        إضافة
                                    </button>
                                </div>

                                {urlError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {urlError}
                                    </div>
                                )}

                                {selectedProducts.length > 0 && (
                                    <div className="space-y-2">
                                        {selectedProducts.map(product => (
                                            <div key={product.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-400 truncate" dir="ltr">{product.url}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedProduct(product.id)}
                                                    className="mr-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-emerald-200"
                                >
                                    حفظ الكود
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
