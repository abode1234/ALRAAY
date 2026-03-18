'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { adminApi } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: string;
    stock: number;
    category: string;
    images: string[];
}

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 40;

    const [availableCategories, setAvailableCategories] = useState<{ slug: string, name: string, nameAr: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    adminApi.getProducts({
                        page: currentPage,
                        limit: LIMIT,
                        category: selectedCategory || undefined
                    }),
                    adminApi.getDisplayCategories()
                ]);

                setProducts(productsData.data || []);
                // @ts-ignore
                const meta = productsData.meta || {};
                setTotalPages(meta.totalPages || 1);

                setAvailableCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, selectedCategory]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            await adminApi.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    {/* Actions Bar */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 pr-10 pl-4 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            >
                                <option value="">جميع التصنيفات</option>
                                {availableCategories.map((cat) => (
                                    <option key={cat.slug} value={cat.slug}>{cat.nameAr || cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <Link
                            href="/products/new"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            إضافة منتج
                        </Link>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد منتجات</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group h-full flex flex-col">
                                    {/* Image */}
                                    <div className="aspect-square bg-gray-100 relative">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-16 w-16 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                            >
                                                <Edit className="h-5 w-5 text-gray-700" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                            >
                                                <Trash2 className="h-5 w-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-[3rem]">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">
                                                {Number(product.price).toLocaleString('ar-IQ')} د.ع
                                            </span>
                                            <span className={`text-sm px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock > 0 ? `${product.stock} متوفر` : 'غير متوفر'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Pagination totalPages={totalPages} />
                </div>
            </main>
        </div>
    );
}
