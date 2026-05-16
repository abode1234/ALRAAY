'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Package, Cpu, MemoryStick, FileText, Check, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { adminApi } from '@/lib/api';
import ProductExcelActions from '@/components/ProductExcelActions';

interface Product {
    id: string;
    name: string;
    description?: string;
    brand: string;
    price: string;
    stock: number;
    category: string;
    images: string[];
    socketType?: string | string[];
    memoryType?: string | string[];
    specifications?: Record<string, string>;
}

interface QuickEditState {
    id: string;
    name: string;
    stock: string;
    socketType: string;
    memoryType: string;
    specifications: Array<{ key: string; value: string }>;
}

const LIMIT = 40;
const RETURN_STATE_KEY = 'alraay-products-return-state';

function specsObjectToRows(specifications?: Record<string, string>) {
    return Object.entries(specifications || {}).map(([key, value]) => ({ key, value }));
}

function specsRowsToObject(rows: Array<{ key: string; value: string }>) {
    return rows.reduce<Record<string, string>>((accumulator, row) => {
        const key = row.key.trim();
        if (key) accumulator[key] = row.value;
        return accumulator;
    }, {});
}

function displayValue(value?: string | string[]) {
    if (!value) return null;
    return Array.isArray(value) ? value.join(' / ') : value;
}

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const selectedCategory = searchParams.get('category') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [availableCategories, setAvailableCategories] = useState<{ slug: string; name: string; nameAr: string }[]>([]);
    const [quickEdit, setQuickEdit] = useState<QuickEditState | null>(null);
    const [savingQuickEdit, setSavingQuickEdit] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const restoredScrollRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData] = await Promise.all([
                    adminApi.getProducts({ page: currentPage, limit: LIMIT, category: selectedCategory || undefined }),
                    adminApi.getDisplayCategories(),
                ]);

                setProducts(productsData.data || []);
                const meta = (productsData as any).meta || {};
                setTotalPages(meta.totalPages || 1);
                setAvailableCategories(categoriesData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, selectedCategory, refreshKey]);

    useEffect(() => {
        if (loading || restoredScrollRef.current) return;

        try {
            const raw = sessionStorage.getItem(RETURN_STATE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw) as { page: number; category: string; scrollY: number };
            if (saved.page === currentPage && saved.category === selectedCategory) {
                restoredScrollRef.current = true;
                requestAnimationFrame(() => {
                    window.scrollTo({ top: saved.scrollY, behavior: 'instant' as ScrollBehavior });
                    sessionStorage.removeItem(RETURN_STATE_KEY);
                });
            }
        } catch {
            sessionStorage.removeItem(RETURN_STATE_KEY);
        }
    }, [loading, currentPage, selectedCategory]);

    const saveReturnState = () => {
        sessionStorage.setItem(RETURN_STATE_KEY, JSON.stringify({
            page: currentPage,
            category: selectedCategory,
            scrollY: window.scrollY,
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        try {
            await adminApi.deleteProduct(id);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category) params.set('category', category);
        else params.delete('category');
        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const openQuickEdit = (product: Product) => {
        setQuickEdit({
            id: product.id,
            name: product.name,
            stock: String(product.stock ?? ''),
            socketType: Array.isArray(product.socketType) ? product.socketType.join(', ') : (product.socketType || ''),
            memoryType: Array.isArray(product.memoryType) ? product.memoryType.join(', ') : (product.memoryType || ''),
            specifications: specsObjectToRows(product.specifications),
        });
    };

    const updateQuickEditSpec = (index: number, field: 'key' | 'value', value: string) => {
        if (!quickEdit) return;
        const nextSpecs = [...quickEdit.specifications];
        nextSpecs[index] = { ...nextSpecs[index], [field]: value };
        setQuickEdit({ ...quickEdit, specifications: nextSpecs });
    };

    const addQuickEditSpec = () => {
        if (!quickEdit) return;
        setQuickEdit({ ...quickEdit, specifications: [...quickEdit.specifications, { key: '', value: '' }] });
    };

    const removeQuickEditSpec = (index: number) => {
        if (!quickEdit) return;
        setQuickEdit({ ...quickEdit, specifications: quickEdit.specifications.filter((_, itemIndex) => itemIndex !== index) });
    };

    const saveQuickEdit = async () => {
        if (!quickEdit) return;

        setSavingQuickEdit(true);
        try {
            const payload = {
                stock: Number(quickEdit.stock || 0),
                socketType: quickEdit.socketType,
                memoryType: quickEdit.memoryType,
                specifications: specsRowsToObject(quickEdit.specifications),
            };

            await adminApi.updateProduct(quickEdit.id, payload);

            setProducts((prev) => prev.map((product) => (
                product.id === quickEdit.id
                    ? {
                        ...product,
                        stock: payload.stock,
                        socketType: payload.socketType,
                        memoryType: payload.memoryType,
                        specifications: payload.specifications,
                    }
                    : product
            )));

            setQuickEdit(null);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('حدث خطأ أثناء التعديل السريع');
        } finally {
            setSavingQuickEdit(false);
        }
    };

    const filteredProducts = useMemo(() => (
        products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ), [products, searchQuery]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="المنتجات" />
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
                <Header title="المنتجات" />

                <div className="p-6">
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="h-10 pr-10 pl-4 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(event) => handleCategoryChange(event.target.value)}
                                className="h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            >
                                <option value="">جميع التصنيفات</option>
                                {availableCategories.map((category) => (
                                    <option key={category.slug} value={category.slug}>{category.nameAr || category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ProductExcelActions
                                selectedCategory={selectedCategory}
                                onImportComplete={() => setRefreshKey((value) => value + 1)}
                            />
                            <Link href="/products/new" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                                <Plus className="h-5 w-5" />
                                إضافة منتج
                            </Link>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد منتجات</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => {
                                const query = new URLSearchParams();
                                query.set('page', String(currentPage));
                                if (selectedCategory) query.set('category', selectedCategory);

                                return (
                                    <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group h-full flex flex-col">
                                        <div className="aspect-square bg-gray-100 relative">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-16 w-16 text-gray-300" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => openQuickEdit(product)} className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                                    <Edit className="h-5 w-5 text-emerald-700" />
                                                </button>
                                                <Link
                                                    href={`/products/${product.id}?${query.toString()}`}
                                                    onClick={saveReturnState}
                                                    className="px-3 py-2 bg-white rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
                                                >
                                                    تعديل كامل
                                                </Link>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col flex-1 gap-2">
                                            <p className="text-xs text-gray-500">{product.brand}</p>
                                            <h3 className="font-semibold text-gray-800 line-clamp-2 h-[3rem]">{product.name}</h3>

                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">{Number(product.price).toLocaleString('ar-IQ')} د.ع</span>
                                                <span className={`text-sm px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.stock > 0 ? `${product.stock} متوفر` : 'غير متوفر'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mt-2 text-xs">
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <Cpu className="h-4 w-4 mt-0.5 text-blue-500" />
                                                    <span className="line-clamp-2">{displayValue(product.socketType) || 'بدون سوكت'}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <MemoryStick className="h-4 w-4 mt-0.5 text-green-500" />
                                                    <span className="line-clamp-2">{displayValue(product.memoryType) || 'بدون نوع RAM'}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <FileText className="h-4 w-4 mt-0.5 text-orange-500" />
                                                    <span className="line-clamp-2">
                                                        {product.specifications && Object.keys(product.specifications).length > 0
                                                            ? `${Object.keys(product.specifications).length} تفاصيل محفوظة`
                                                            : 'بدون تفاصيل'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Pagination totalPages={totalPages} />
                </div>

                {quickEdit && (
                    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
                        <div className="flex justify-center px-4 py-8">
                            <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">تعديل سريع</h2>
                                        <p className="text-sm text-gray-500 mt-1">{quickEdit.name}</p>
                                    </div>
                                    <button onClick={() => setQuickEdit(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المخزون</label>
                                            <input
                                                type="number"
                                                value={quickEdit.stock}
                                                onChange={(event) => setQuickEdit({ ...quickEdit, stock: event.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">السوكت</label>
                                            <input
                                                type="text"
                                                value={quickEdit.socketType}
                                                onChange={(event) => setQuickEdit({ ...quickEdit, socketType: event.target.value })}
                                                className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                placeholder="مثال: AM5, LGA1700"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع الذاكرة</label>
                                        <input
                                            type="text"
                                            value={quickEdit.memoryType}
                                            onChange={(event) => setQuickEdit({ ...quickEdit, memoryType: event.target.value })}
                                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                            placeholder="مثال: DDR4, DDR5"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">التفاصيل</label>
                                            <button onClick={addQuickEditSpec} type="button" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">إضافة سطر</button>
                                        </div>

                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                            {quickEdit.specifications.length === 0 && (
                                                <div className="text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">لا توجد تفاصيل حالياً</div>
                                            )}
                                            {quickEdit.specifications.map((specification, index) => (
                                                <div key={`${specification.key}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                                    <input
                                                        type="text"
                                                        value={specification.key}
                                                        onChange={(event) => updateQuickEditSpec(index, 'key', event.target.value)}
                                                        className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                        placeholder="اسم الخاصية"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={specification.value}
                                                        onChange={(event) => updateQuickEditSpec(index, 'value', event.target.value)}
                                                        className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                        placeholder="القيمة"
                                                    />
                                                    <button type="button" onClick={() => removeQuickEditSpec(index)} className="h-11 w-11 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={saveQuickEdit} disabled={savingQuickEdit} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                        {savingQuickEdit ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="h-5 w-5" />}
                                        حفظ التعديلات
                                    </button>
                                    <button onClick={() => setQuickEdit(null)} type="button" className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-gray-700">
                                        <X className="h-5 w-5" />
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}