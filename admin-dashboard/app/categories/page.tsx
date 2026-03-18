'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, Grid3X3, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface DisplayCategory {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    icon: string;
    link?: string;
    order: number;
    isActive: boolean;
    backendCategory?: string;
}


export default function CategoriesPage() {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const LIMIT = 40;

    const [categories, setCategories] = useState<DisplayCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DisplayCategory | null>(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        nameAr: '',
        slug: '',
        icon: '',
        link: '',
        order: 0,
    });
    const [newCategoryImage, setNewCategoryImage] = useState<UploadedImage[]>([]);
    const [editCategoryImage, setEditCategoryImage] = useState<UploadedImage[]>([]);

    const totalPages = Math.ceil(categories.length / LIMIT);
    const displayedCategories = categories.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

    const fetchCategories = async () => {
        try {
            const displayData = await adminApi.getDisplayCategories();
            setCategories(displayData.sort((a: DisplayCategory, b: DisplayCategory) => a.order - b.order));
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[أإآا]/g, 'a')
            .replace(/[ب]/g, 'b')
            .replace(/[ت]/g, 't')
            .replace(/[ث]/g, 'th')
            .replace(/[ج]/g, 'j')
            .replace(/[ح]/g, 'h')
            .replace(/[خ]/g, 'kh')
            .replace(/[د]/g, 'd')
            .replace(/[ذ]/g, 'th')
            .replace(/[ر]/g, 'r')
            .replace(/[ز]/g, 'z')
            .replace(/[س]/g, 's')
            .replace(/[ش]/g, 'sh')
            .replace(/[ص]/g, 's')
            .replace(/[ض]/g, 'd')
            .replace(/[ط]/g, 't')
            .replace(/[ظ]/g, 'z')
            .replace(/[ع]/g, 'a')
            .replace(/[غ]/g, 'gh')
            .replace(/[ف]/g, 'f')
            .replace(/[ق]/g, 'q')
            .replace(/[ك]/g, 'k')
            .replace(/[ل]/g, 'l')
            .replace(/[م]/g, 'm')
            .replace(/[ن]/g, 'n')
            .replace(/[ه]/g, 'h')
            .replace(/[و]/g, 'w')
            .replace(/[ي]/g, 'y')
            .replace(/[ة]/g, 'a')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const icon = newCategoryImage.length > 0 ? newCategoryImage[0].url : newCategory.icon;
            await adminApi.createDisplayCategory({
                ...newCategory,
                icon,
                slug: newCategory.slug || generateSlug(newCategory.name),
            });
            setNewCategory({
                name: '',
                nameAr: '',
                slug: '',
                icon: '',
                link: '',
                order: 0,
            });
            setNewCategoryImage([]);
            setShowAddForm(false);
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            alert('حدث خطأ أثناء إنشاء التصنيف');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const icon = editCategoryImage.length > 0 ? editCategoryImage[0].url : editingCategory.icon;
            await adminApi.updateDisplayCategory(editingCategory.id, { ...editingCategory, icon });
            setEditingCategory(null);
            setEditCategoryImage([]);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('حدث خطأ أثناء تحديث التصنيف');
        }
    };

    const handleToggleActive = async (category: DisplayCategory) => {
        try {
            await adminApi.updateDisplayCategory(category.id, { isActive: !category.isActive });
            fetchCategories();
        } catch (error) {
            console.error('Error toggling category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

        try {
            await adminApi.deleteDisplayCategory(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="تصنيفات الصفحة الرئيسية" />
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
                <Header title="تصنيفات الصفحة الرئيسية" />

                <div className="p-6">
                    {/* Actions Bar */}
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
                        <p className="text-gray-600">
                            إجمالي التصنيفات: <span className="font-bold text-emerald-600">{categories.length}</span>
                        </p>

                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            إضافة تصنيف
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-blue-700 text-sm">
                            <strong>ملاحظة:</strong> هذه التصنيفات تظهر في شريط التصنيفات على الصفحة الرئيسية.
                            قم برفع صورة للأيقونة، وتحديد رابط مخصص أو تركه فارغاً للربط التلقائي بصفحة المنتجات.
                        </p>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold mb-4">إضافة تصنيف جديد</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="الاسم بالإنجليزية *"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="الاسم بالعربية *"
                                        value={newCategory.nameAr}
                                        onChange={(e) => setNewCategory({ ...newCategory, nameAr: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        صورة الأيقونة *
                                    </label>
                                    <ImageUpload
                                        multiple={false}
                                        value={newCategoryImage}
                                        onChange={setNewCategoryImage}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="الرابط (slug)"
                                        value={newCategory.slug}
                                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <input
                                        type="text"
                                        placeholder="رابط مخصص (اختياري)"
                                        value={newCategory.link}
                                        onChange={(e) => setNewCategory({ ...newCategory, link: e.target.value })}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الترتيب"
                                        value={newCategory.order}
                                        className="h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
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
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories List */}
                    {categories.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                            <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-500">لا توجد تصنيفات</p>
                            <p className="text-gray-400 mt-2">أضف تصنيفات لتظهر في الصفحة الرئيسية</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">الترتيب</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">الأيقونة</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">الاسم</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">الرابط</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">الحالة</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedCategories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 ${!category.isActive ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <td className="py-4 px-6">
                                                <span className="flex items-center gap-2 text-gray-500">
                                                    <GripVertical className="h-4 w-4" />
                                                    {category.order}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {category.icon.startsWith('http') ? (
                                                    <img
                                                        src={category.icon}
                                                        alt={category.nameAr}
                                                        className="w-12 h-12 object-contain rounded-lg bg-gray-100"
                                                    />
                                                ) : (
                                                    <span className="text-3xl">{category.icon}</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-gray-800">{category.nameAr}</p>
                                                <p className="text-sm text-gray-500">{category.name}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {category.link || `/products?category=${category.slug}`}
                                                </code>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${category.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {category.isActive ? 'مفعّل' : 'معطّل'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(category)}
                                                        className={`p-2 rounded-lg transition-colors ${category.isActive
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        title={category.isActive ? 'إخفاء' : 'إظهار'}
                                                    >
                                                        {category.isActive ? (
                                                            <Eye className="h-5 w-5" />
                                                        ) : (
                                                            <EyeOff className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCategory(category)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                    >
                                                        <Edit className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination totalPages={totalPages} />
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editingCategory && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-xl font-bold mb-4">تعديل التصنيف</h2>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="الاسم بالإنجليزية"
                                        value={editingCategory.name}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, name: e.target.value })
                                        }
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="الاسم بالعربية"
                                        value={editingCategory.nameAr}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, nameAr: e.target.value })
                                        }
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            صورة الأيقونة
                                        </label>
                                        {editingCategory.icon && editCategoryImage.length === 0 && (
                                            <div className="mb-2">
                                                {editingCategory.icon.startsWith('http') ? (
                                                    <img
                                                        src={editingCategory.icon}
                                                        alt="Current icon"
                                                        className="w-20 h-20 object-contain rounded-lg bg-gray-100"
                                                    />
                                                ) : (
                                                    <span className="text-4xl">{editingCategory.icon}</span>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">الصورة الحالية</p>
                                            </div>
                                        )}
                                        <ImageUpload
                                            multiple={false}
                                            value={editCategoryImage}
                                            onChange={setEditCategoryImage}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="الرابط (slug)"
                                        value={editingCategory.slug}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, slug: e.target.value })
                                        }
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="رابط مخصص (اختياري)"
                                        value={editingCategory.link || ''}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, link: e.target.value })
                                        }
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الترتيب"
                                        value={editingCategory.order}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                order: parseInt(e.target.value) || 0,
                                            })
                                        }
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
                                            onClick={() => setEditingCategory(null)}
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
