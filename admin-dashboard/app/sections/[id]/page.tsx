'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { adminApi } from '@/lib/api';

const SECTION_TYPES = [
    { value: 'PRODUCT', label: 'منتجات فقط' },
    { value: 'BUILD', label: 'تجميعات فقط' },
    { value: 'MIXED', label: 'مختلط (منتجات وتجميعات)' },
];

export default function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        titleAr: '',
        slug: '',
        type: 'MIXED',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        const fetchSection = async () => {
            try {
                // Since getSection (single) wasn't explicitly added to api.ts, I'll fetch all and find (or I should have added getSection)
                // Actually I missed adding `getSection(id)` to api.ts, I only added `updateSection`.
                // I will try to fetch list and find, or use an endpoint if it exists.
                // Best practice: Add getSection to api.ts properly. But for now I will rely on fetching all or assume I can fetch single.
                // Let's rely on finding it from the list for now if I want to avoid another api.ts edit cycle immediately, 
                // OR better, try to fetch `/sections/${id}` directly here using fetch to be safe.
                // Or I can add `getSection` to `api.ts` in next step.
                // I'll use direct fetch via adminApi private fetch method exposed? No it's private.
                // I'll add `getSection` to `api.ts` concurrently or just use `fetch`.
                // Let's assume I'll fix api.ts.
                // Wait, I can iterate over `getSections()` result.

                const sections = await adminApi.getSections();
                const section = sections.find((s: any) => s.id === id);
                if (section) {
                    setFormData({
                        title: section.title,
                        titleAr: section.titleAr || '',
                        slug: section.slug,
                        type: section.type,
                        order: section.order,
                        isActive: section.isActive,
                    });
                } else {
                    setError('القسم غير موجود');
                }
            } catch (err: any) {
                setError(err.message || 'حدث خطأ أثناء جلب بيانات القسم');
            } finally {
                setFetching(false);
            }
        };
        fetchSection();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminApi.updateSection(id, {
                ...formData,
                order: Number(formData.order),
            });
            router.push('/sections');
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحديث القسم');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="تعديل القسم" />
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
                <Header title="تعديل القسم" />

                <div className="p-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        رجوع
                    </button>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان القسم (إنجليزي/افتراضي) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            {/* Title AR */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان القسم (عربي)
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleAr}
                                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الرابط (Slug) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-left"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع المحتوى *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                >
                                    {SECTION_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الترتيب (الأقل يظهر أولاً)
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            {/* IsActive */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 select-none">
                                    تفعيل القسم (عرضه في الموقع)
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
