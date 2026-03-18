'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, LayoutTemplate } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { adminApi } from '@/lib/api';

interface Section {
    id: string;
    title: string;
    slug: string;
    type: string;
    isActive: boolean;
    order: number;
    _count?: { items: number };
}

export default function SectionsPage() {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const LIMIT = 40;

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.ceil(sections.length / LIMIT);
    const displayedSections = sections.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const data = await adminApi.getSections();
            setSections(data);
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        try {
            await adminApi.deleteSection(id);
            setSections(sections.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting section:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="الأقسام" />
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
                <Header title="الأقسام" />

                <div className="p-6">
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">إدارة أقسام الصفحة الرئيسية</h2>
                        <Link
                            href="/sections/new"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            إضافة قسم
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">العنوان</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">النوع</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">الرابط (Slug)</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">الترتيب</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {displayedSections.map((section) => (
                                    <tr key={section.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                                    <LayoutTemplate className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-gray-800">{section.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                {section.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dir-ltr text-right">{section.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${section.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'}`}>
                                                {section.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{section.order}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/sections/${section.id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-emerald-600 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(section.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sections.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                لا توجد أقسام حالياً
                            </div>
                        ) : (
                            <Pagination totalPages={totalPages} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
