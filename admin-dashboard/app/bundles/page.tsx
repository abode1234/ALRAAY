'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Package, Monitor, Eye, Wrench } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { adminApi, type Build } from '@/lib/api';

export default function BundlesPage() {
    const [bundles, setBundles] = useState<Build[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const data = await adminApi.getBuilds(true);
                setBundles(data);
            } catch (error) {
                console.error('Error fetching bundles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBundles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه التجميعة؟')) return;

        try {
            await adminApi.deleteBuild(id);
            setBundles(bundles.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting bundle:', error);
        }
    };

    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="التجميعات" />
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
                <Header title="التجميعات الجاهزة" />

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
                        </div>

                        <div className="flex items-center gap-3">

                            <Link
                                href="/bundles/new"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                إضافة تجميعة
                            </Link>
                        </div>
                    </div>

                    {/* Bundles Grid */}
                    {filteredBundles.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد تجميعات</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredBundles.map((bundle) => (
                                <div key={bundle.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                    <div className="p-6">
                                        <h3 className="font-semibold text-xl text-gray-800 mb-2">{bundle.name}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{bundle.description || 'لا يوجد وصف'}</p>

                                        <div className="flex items-center justify-between mt-4 border-t pt-4">
                                            <span className="text-lg font-bold text-emerald-600">
                                                {bundle.components.reduce((sum, comp) => sum + Number(comp.product.price), 0).toLocaleString('ar-IQ')} د.ع
                                            </span>
                                            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {bundle.components.length} قطع
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                            <a
                                                href={`https://alraay.com/bundles/${bundle.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
                                                title="عرض في الموقع"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>عرض</span>
                                            </a>
                                            <Link
                                                href={`/bundles/${bundle.id}`}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>تعديل</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(bundle.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>حذف</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
