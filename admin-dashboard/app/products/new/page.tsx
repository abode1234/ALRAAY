'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, Plus, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import { adminApi } from '@/lib/api';

interface UploadedImage {
    id: string;
    filename: string;
    path: string;
    url: string;
    mimetype: string;
    size: number;
}



export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        brand: '',
        category: 'CPU',
        stock: '',
        powerConsumption: '',
        platform: '',
        socketType: '',
        memoryType: '',
        isNewArrival: true,
        specifications: {} as Record<string, string>,
    });

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const [newSocketInput, setNewSocketInput] = useState('');
    const [newMemoryInput, setNewMemoryInput] = useState('');
    const [socketPresets, setSocketPresets] = useState<string[]>(['LGA 1700', 'LGA 1200', 'AM5', 'AM4', 'TR4', 'sTRX4']);
    const [memoryPresets, setMemoryPresets] = useState<string[]>(['DDR4', 'DDR5']);

    // Load presets from localStorage (set via التوافق page)
    useEffect(() => {
        try {
            const sockets = localStorage.getItem('compat_socket_presets');
            if (sockets) setSocketPresets(JSON.parse(sockets));
            const mems = localStorage.getItem('compat_memory_presets');
            if (mems) setMemoryPresets(JSON.parse(mems));
        } catch { /* keep defaults */ }
    }, []);

    // Categories and Brands
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);

    // Sections logic
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    // Fetch categories and sections on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectionsData, categoriesData] = await Promise.all([
                    adminApi.getSections(),
                    adminApi.getDisplayCategories()
                ]);
                setSections(sectionsData.filter((s: any) => s.isActive && (s.type === 'PRODUCT' || s.type === 'MIXED')));
                setCategories(categoriesData.filter((c: any) => c.isActive));
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    // Fetch brands when category changes
    useEffect(() => {
        const fetchBrands = async () => {
            if (!formData.category) {
                setBrands([]);
                return;
            }

            setLoadingBrands(true);
            try {
                const data = await adminApi.getBrandsByCategory(formData.category);
                setBrands(data);
                // Reset brand when category changes
                setFormData(prev => ({ ...prev, brand: '' }));
            } catch (err) {
                console.error('Error fetching brands:', err);
                setBrands([]);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, [formData.category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get image URLs from uploaded images
            const imageUrls = uploadedImages.map(img => img.url);

            await adminApi.createProduct({
                ...formData,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                stock: parseInt(formData.stock),
                powerConsumption: formData.powerConsumption ? parseInt(formData.powerConsumption) : null,
                isNewArrival: formData.isNewArrival,
                images: imageUrls,
                sectionIds: selectedSections,
            });
            router.push('/products');
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إضافة المنتج');
        } finally {
            setLoading(false);
        }
    };

    const addSpec = () => {
        if (newSpecKey && newSpecValue) {
            setFormData({
                ...formData,
                specifications: { ...formData.specifications, [newSpecKey]: newSpecValue },
            });
            setNewSpecKey('');
            setNewSpecValue('');
        }
    };

    const removeSpec = (key: string) => {
        const { [key]: _, ...rest } = formData.specifications;
        setFormData({ ...formData, specifications: rest });
    };

    return (
        <div className="flex min-h-screen bg-gray-100" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64">
                <Header title="إضافة منتج جديد" />

                <div className="p-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                    >
                        <ArrowRight className="h-5 w-5" />
                        رجوع
                    </button>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المنتج *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البراند *
                                </label>
                                <select
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                    disabled={loadingBrands || !formData.category}
                                >
                                    <option value="">اختر البراند</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.name}>
                                            {brand.nameAr || brand.name}
                                        </option>
                                    ))}
                                </select>
                                {loadingBrands && (
                                    <p className="text-xs text-gray-500 mt-1">جاري تحميل البراندات...</p>
                                )}
                                {!formData.category && (
                                    <p className="text-xs text-gray-500 mt-1">اختر التصنيف أولاً</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السعر (د.ع) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            {/* Compare At Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السعر القديم (للتخفيضات)
                                </label>
                                <input
                                    type="number"
                                    value={formData.compareAtPrice}
                                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    placeholder="اختياري"
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الكمية المتوفرة *
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التصنيف *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    required
                                >
                                    <option value="">اختر التصنيف</option>
                                    {categories.map((cat) => (
                                        <option key={cat.slug} value={cat.slug}>
                                            {cat.nameAr || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Power Consumption */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    استهلاك الطاقة (واط)
                                </label>
                                <input
                                    type="number"
                                    value={formData.powerConsumption}
                                    onChange={(e) => setFormData({ ...formData, powerConsumption: e.target.value })}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    placeholder="اختياري"
                                />
                            </div>
                        </div>

                        {/* Compatibility Fields */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-blue-800 mb-2">إعدادات التوافق (لتجميع الكمبيوتر)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Platform */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">المنصة</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">غير محدد</option>
                                        <option value="Intel">Intel</option>
                                        <option value="AMD">AMD</option>
                                    </select>
                                </div>

                                {/* Socket - Free text input with tags */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">السوكت / الجيل</label>
                                    {/* Quick select from presets */}
                                    {socketPresets.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            <span className="text-xs text-gray-400 self-center ml-1">اختر سريع:</span>
                                            {socketPresets
                                                .filter(s => !formData.socketType.split(',').map(x => x.trim()).filter(Boolean).includes(s))
                                                .map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.socketType ? formData.socketType.split(',').filter(Boolean) : [];
                                                            setFormData({ ...formData, socketType: [...current, s].join(',') });
                                                        }}
                                                        className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
                                                    >
                                                        + {s}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                    {formData.socketType && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.socketType.split(',').filter(Boolean).map((socket) => (
                                                <span key={socket} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                                    {socket}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const sockets = formData.socketType.split(',').filter(s => s !== socket);
                                                            setFormData({ ...formData, socketType: sockets.join(',') });
                                                        }}
                                                        className="p-0.5 hover:bg-blue-200 rounded"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSocketInput}
                                            onChange={(e) => setNewSocketInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = newSocketInput.trim();
                                                    if (!val) return;
                                                    const current = formData.socketType ? formData.socketType.split(',').filter(Boolean) : [];
                                                    if (!current.includes(val)) {
                                                        setFormData({ ...formData, socketType: [...current, val].join(',') });
                                                    }
                                                    setNewSocketInput('');
                                                }
                                            }}
                                            className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="اكتب اسم السوكت ثم اضغط إضافة"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const val = newSocketInput.trim();
                                                if (!val) return;
                                                const current = formData.socketType ? formData.socketType.split(',').filter(Boolean) : [];
                                                if (!current.includes(val)) {
                                                    setFormData({ ...formData, socketType: [...current, val].join(',') });
                                                }
                                                setNewSocketInput('');
                                            }}
                                            className="px-4 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" />
                                            إضافة
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Memory Type - Free text input with tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الذاكرة</label>
                                {/* Quick select from presets */}
                                {memoryPresets.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <span className="text-xs text-gray-400 self-center ml-1">اختر سريع:</span>
                                        {memoryPresets
                                            .filter(m => !formData.memoryType.split(',').map(x => x.trim()).filter(Boolean).includes(m))
                                            .map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = formData.memoryType ? formData.memoryType.split(',').filter(Boolean) : [];
                                                        setFormData({ ...formData, memoryType: [...current, m].join(',') });
                                                    }}
                                                    className="px-2.5 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors"
                                                >
                                                    + {m}
                                                </button>
                                            ))}
                                    </div>
                                )}
                                {formData.memoryType && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.memoryType.split(',').filter(Boolean).map((mem) => (
                                            <span key={mem} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                                {mem}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const mems = formData.memoryType.split(',').filter(m => m !== mem);
                                                        setFormData({ ...formData, memoryType: mems.join(',') });
                                                    }}
                                                    className="p-0.5 hover:bg-green-200 rounded"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMemoryInput}
                                        onChange={(e) => setNewMemoryInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = newMemoryInput.trim();
                                                if (!val) return;
                                                const current = formData.memoryType ? formData.memoryType.split(',').filter(Boolean) : [];
                                                if (!current.includes(val)) {
                                                    setFormData({ ...formData, memoryType: [...current, val].join(',') });
                                                }
                                                setNewMemoryInput('');
                                            }
                                        }}
                                        className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="اكتب نوع الذاكرة ثم اضغط إضافة (مثل DDR4, DDR5)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const val = newMemoryInput.trim();
                                            if (!val) return;
                                            const current = formData.memoryType ? formData.memoryType.split(',').filter(Boolean) : [];
                                            if (!current.includes(val)) {
                                                setFormData({ ...formData, memoryType: [...current, val].join(',') });
                                            }
                                            setNewMemoryInput('');
                                        }}
                                        className="px-4 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-blue-600">هذه الإعدادات تحدد أي قطع تتوافق مع هذا المنتج في صفحة تجميع الكمبيوتر.</p>
                        </div>

                        {/* Sections (Display In) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عرض في الأقسام (اختياري)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => {
                                            if (selectedSections.includes(section.id)) {
                                                setSelectedSections(selectedSections.filter(id => id !== section.id));
                                            } else {
                                                setSelectedSections([...selectedSections, section.id]);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSections.includes(section.id)
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                                {sections.length === 0 && <span className="text-gray-500 text-sm">لا توجد أقسام متاحة للمنتجات</span>}
                            </div>
                        </div>

                        {/* New Arrival Flag */}
                        <div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isNewArrival"
                                    checked={formData.isNewArrival}
                                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-600"
                                />
                                <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    عرض في "وصل حديثاً"
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 mr-8">
                                عند التفعيل، سيظهر المنتج في قسم "وصل حديثاً" في الصفحة الرئيسية وصفحة المنتجات.
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                required
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                صور المنتج
                            </label>
                            <ImageUpload
                                multiple
                                value={uploadedImages}
                                onChange={setUploadedImages}
                                maxFiles={10}
                            />
                        </div>

                        {/* Specifications */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المواصفات
                            </label>
                            <div className="space-y-2 mb-3">
                                {Object.entries(formData.specifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <span className="font-medium">{key}:</span>
                                        <span className="flex-1">{value}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(key)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSpecKey}
                                    onChange={(e) => setNewSpecKey(e.target.value)}
                                    className="flex-1 h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    placeholder="اسم المواصفة"
                                />
                                <input
                                    type="text"
                                    value={newSpecValue}
                                    onChange={(e) => setNewSpecValue(e.target.value)}
                                    className="flex-1 h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    placeholder="القيمة"
                                />
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="px-4 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg"
                                >
                                    إضافة
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
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
                                        حفظ المنتج
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
