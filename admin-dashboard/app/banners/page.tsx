'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import Pagination from '@/components/Pagination';
import { adminApi } from '@/lib/api';

interface UploadedImage {
    id: string;
    filename: string;
    path: string;
    url: string;
    mimetype: string;
    size: number;
}

interface Banner {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    link?: string;
    position: string;
    isActive: boolean;
    order: number;
}

const positionLabels: Record<string, string> = {
    MAIN_SLIDER: 'السلايدر الرئيسي',
    SECONDARY_TOP: 'البانر الثابت العلوي',
    SECONDARY_BOTTOM: 'البانر الثابت السفلي',
};

const positions = [
    { value: 'MAIN_SLIDER', label: 'السلايدر الرئيسي' },
    { value: 'SECONDARY_TOP', label: 'البانر الثابت العلوي' },
    { value: 'SECONDARY_BOTTOM', label: 'البانر الثابت السفلي' },
];

export default function BannersPage() {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const LIMIT = 40;

    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPosition, setFilterPosition] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [newBanner, setNewBanner] = useState({
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        position: 'MAIN_SLIDER',
        order: 0,
    });
    const [newBannerImage, setNewBannerImage] = useState<UploadedImage[]>([]);
    const [editBannerImage, setEditBannerImage] = useState<UploadedImage[]>([]);

    const totalPages = Math.ceil(banners.length / LIMIT);
    const displayedBanners = banners.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

    const fetchBanners = async () => {
        try {
            const data = await adminApi.getBanners(filterPosition || undefined);
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [filterPosition]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const imageUrl = newBannerImage.length > 0 ? newBannerImage[0].url : newBanner.imageUrl;
            await adminApi.createBanner({ ...newBanner, imageUrl });
            setNewBanner({
                title: '',
                description: '',
                imageUrl: '',
                link: '',
                position: 'MAIN_SLIDER',
                order: 0,
            });
            setNewBannerImage([]);
            setShowAddForm(false);
            fetchBanners();
        } catch (error) {
            console.error('Error creating banner:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBanner) return;

        try {
            const imageUrl = editBannerImage.length > 0 ? editBannerImage[0].url : editingBanner.imageUrl;
            await adminApi.updateBanner(editingBanner.id, { ...editingBanner, imageUrl });
            setEditingBanner(null);
            setEditBannerImage([]);
            fetchBanners();
        } catch (error) {
            console.error('Error updating banner:', error);
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            await adminApi.updateBanner(banner.id, { isActive: !banner.isActive });
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;

        try {
            await adminApi.deleteBanner(id);
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="البانرات" />
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
                <Header title="البانرات" />

                <div className="p-6">
                    {/* Actions Bar */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
                        <select
                            value={filterPosition}
                            onChange={(e) => setFilterPosition(e.target.value)}
                            className="h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                            <option value="">جميع المواقع</option>
                            {positions.map((pos) => (
                                <option key={pos.value} value={pos.value}>{pos.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            إضافة بانر
                        </button>
                    </div>

                    {/* Position Guide */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-3">دليل مواقع البانرات:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-medium text-blue-700">السلايدر الرئيسي</p>
                                <p className="text-blue-600">يدعم عدة بانرات تتغير تلقائياً</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="font-medium text-green-700">البانر الثابت العلوي</p>
                                <p className="text-green-600">بانر واحد فقط (فوق)</p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                <p className="font-medium text-teal-700">البانر الثابت السفلي</p>
                                <p className="text-teal-600">بانر واحد فقط (تحت)</p>
                            </div>
                        </div>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold mb-4">إضافة بانر جديد</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="عنوان البانر *"
                                        value={newBanner.title}
                                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <select
                                        value={newBanner.position}
                                        onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    >
                                        {positions.map((pos) => (
                                            <option key={pos.value} value={pos.value}>{pos.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        صورة البانر *
                                    </label>
                                    <ImageUpload
                                        multiple={false}
                                        value={newBannerImage}
                                        onChange={setNewBannerImage}
                                        imageType="banner"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="url"
                                        placeholder="رابط الوجهة (اختياري)"
                                        value={newBanner.link}
                                        onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الترتيب"
                                        value={newBanner.order}
                                        onChange={(e) => setNewBanner({ ...newBanner, order: parseInt(e.target.value) || 0 })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>
                                <textarea
                                    placeholder="الوصف (اختياري)"
                                    value={newBanner.description}
                                    onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                    >
                                        حفظ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Banners List */}
                    {banners.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد بانرات</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedBanners.map((banner) => (
                                <div
                                    key={banner.id}
                                    className={`bg-white rounded-xl shadow-sm overflow-hidden ${!banner.isActive ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex">
                                        {/* Image Preview */}
                                        <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
                                            <img
                                                src={banner.imageUrl}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 mb-1">{banner.title}</h3>
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                        {positionLabels[banner.position] || banner.position}
                                                    </span>
                                                    {banner.description && (
                                                        <p className="text-sm text-gray-500 mt-2">{banner.description}</p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(banner)}
                                                        className={`p-2 rounded-lg transition-colors ${banner.isActive
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        title={banner.isActive ? 'إخفاء' : 'إظهار'}
                                                    >
                                                        {banner.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingBanner(banner)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                    >
                                                        <Edit className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Pagination totalPages={totalPages} />
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editingBanner && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                                <h2 className="text-xl font-bold mb-4">تعديل البانر</h2>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="عنوان البانر"
                                        value={editingBanner.title}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <select
                                        value={editingBanner.position}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    >
                                        {positions.map((pos) => (
                                            <option key={pos.value} value={pos.value}>{pos.label}</option>
                                        ))}
                                    </select>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            صورة البانر
                                        </label>
                                        {editingBanner.imageUrl && editBannerImage.length === 0 && (
                                            <div className="mb-2">
                                                <img
                                                    src={editingBanner.imageUrl}
                                                    alt="Current banner"
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">الصورة الحالية</p>
                                            </div>
                                        )}
                                        <ImageUpload
                                            multiple={false}
                                            value={editBannerImage}
                                            onChange={setEditBannerImage}
                                            imageType="banner"
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="رابط الوجهة"
                                        value={editingBanner.link || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الترتيب"
                                        value={editingBanner.order}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) || 0 })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                        >
                                            حفظ التغييرات
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingBanner(null)}
                                            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
