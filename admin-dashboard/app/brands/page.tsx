'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, Tags, X } from 'lucide-react';
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

interface Brand {
    id: string;
    name: string;
    nameAr?: string;
    logo?: string;
    slug: string;
    categories: string[];
    isActive: boolean;
}

// ... imports

export default function BrandsPage() {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const LIMIT = 40;

    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [newBrand, setNewBrand] = useState({ name: '', nameAr: '', logo: '', slug: '', categories: [] as string[] });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBrandLogo, setNewBrandLogo] = useState<UploadedImage[]>([]);
    const [editBrandLogo, setEditBrandLogo] = useState<UploadedImage[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ slug: string, name: string, nameAr: string }[]>([]);

    const totalPages = Math.ceil(brands.length / LIMIT);
    const displayedBrands = brands.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

    const fetchData = async () => {
        try {
            const [brandsData, categoriesData] = await Promise.all([
                adminApi.getBrands(),
                adminApi.getDisplayCategories()
            ]);
            setBrands(brandsData);
            setAvailableCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleCategory = (categorySlug: string, isNew: boolean = true) => {
        if (isNew) {
            setNewBrand(prev => ({
                ...prev,
                categories: prev.categories.includes(categorySlug)
                    ? prev.categories.filter(c => c !== categorySlug)
                    : [...prev.categories, categorySlug]
            }));
        } else if (editingBrand) {
            setEditingBrand(prev => prev ? ({
                ...prev,
                categories: prev.categories.includes(categorySlug)
                    ? prev.categories.filter(c => c !== categorySlug)
                    : [...prev.categories, categorySlug]
            }) : null);
        }
    };

    // ... handleCreate, handleUpdate, handleDelete remain similar but call fetchData instead of fetchBrands

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const logo = newBrandLogo.length > 0 ? newBrandLogo[0].url : newBrand.logo;
            await adminApi.createBrand({
                ...newBrand,
                logo,
                slug: newBrand.slug || newBrand.name.toLowerCase().replace(/\s+/g, '-'),
            });
            setNewBrand({ name: '', nameAr: '', logo: '', slug: '', categories: [] });
            setNewBrandLogo([]);
            setShowAddForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating brand:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        try {
            const logo = editBrandLogo.length > 0 ? editBrandLogo[0].url : editingBrand.logo;
            await adminApi.updateBrand(editingBrand.id, { ...editingBrand, logo });
            setEditingBrand(null);
            setEditBrandLogo([]);
            fetchData();
        } catch (error) {
            console.error('Error updating brand:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا البراند؟')) return;

        try {
            await adminApi.deleteBrand(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting brand:', error);
        }
    };

    const getCategoryLabel = (slug: string) => {
        const category = availableCategories.find(c => c.slug === slug);
        return category ? (category.nameAr || category.name) : slug;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="البراندات" />
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
                <Header title="البراندات" />

                <div className="p-6">
                    {/* Add Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            إضافة براند
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold mb-4">إضافة براند جديد</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="اسم البراند (إنجليزي) *"
                                        value={newBrand.name}
                                        onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="اسم البراند (عربي)"
                                        value={newBrand.nameAr}
                                        onChange={(e) => setNewBrand({ ...newBrand, nameAr: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Slug (اختياري)"
                                        value={newBrand.slug}
                                        onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">شعار البراند</label>
                                    <ImageUpload
                                        multiple={false}
                                        value={newBrandLogo}
                                        onChange={setNewBrandLogo}
                                    />
                                </div>

                                {/* Categories Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الفئات</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableCategories.map((cat) => (
                                            <button
                                                key={cat.slug}
                                                type="button"
                                                onClick={() => toggleCategory(cat.slug, true)}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${newBrand.categories.includes(cat.slug)
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {cat.nameAr || cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                    >
                                        حفظ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowAddForm(false); setNewBrand({ name: '', nameAr: '', logo: '', slug: '', categories: [] }); setNewBrandLogo([]); }}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Brands Grid */}
                    {brands.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <Tags className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد براندات</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {displayedBrands.map((brand) => (
                                    <div key={brand.id} className="bg-white rounded-xl shadow-sm p-6 text-center group relative">
                                        {/* Logo */}
                                        <div className="w-full aspect-[3/2] mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-3" />
                                            ) : (
                                                <Tags className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Name */}
                                        <h3 className="font-bold text-gray-800">{brand.name}</h3>
                                        {brand.nameAr && <p className="text-sm text-gray-500">{brand.nameAr}</p>}

                                        {/* Categories */}
                                        {brand.categories && brand.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center mt-2">
                                                {brand.categories.slice(0, 3).map((cat) => (
                                                    <span key={cat} className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                                                        {getCategoryLabel(cat)}
                                                    </span>
                                                ))}
                                                {brand.categories.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                        +{brand.categories.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={() => setEditingBrand({ ...brand, categories: brand.categories || [] })}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                            >
                                                <Edit className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination totalPages={totalPages} />
                        </>
                    )}

                    {/* Edit Modal */}
                    {editingBrand && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">تعديل البراند</h2>
                                    <button onClick={() => setEditingBrand(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="اسم البراند (إنجليزي)"
                                        value={editingBrand.name}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="اسم البراند (عربي)"
                                        value={editingBrand.nameAr || ''}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, nameAr: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">شعار البراند</label>
                                        {editingBrand.logo && editBrandLogo.length === 0 && (
                                            <div className="mb-2 flex items-center gap-2">
                                                <img
                                                    src={editingBrand.logo}
                                                    alt="Current logo"
                                                    className="w-16 h-16 object-contain rounded-lg border"
                                                />
                                                <span className="text-xs text-gray-500">الشعار الحالي</span>
                                            </div>
                                        )}
                                        <ImageUpload
                                            multiple={false}
                                            value={editBrandLogo}
                                            onChange={setEditBrandLogo}
                                        />
                                    </div>

                                    {/* Categories Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الفئات</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map((cat) => (
                                                <button
                                                    key={cat.slug}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.slug, false)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${editingBrand.categories.includes(cat.slug)
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {cat.nameAr || cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                        >
                                            حفظ التغييرات
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setEditingBrand(null); setEditBrandLogo([]); }}
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
