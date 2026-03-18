'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Search, Plus, Trash2, Cpu, CircuitBoard, HardDrive, Zap, Box, Fan, ArrowRight, AlertCircle } from 'lucide-react';
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

const CATEGORIES = [
    { key: 'PSU', name: 'مزود الطاقة', nameVariants: ['مزود الطاقة', 'مزودات الطاقة', 'باور سبلاي', 'psu', 'power supply'], icon: Zap, required: true, multiple: false },
    { key: 'CPU', name: 'المعالج', nameVariants: ['المعالج', 'المعالجات', 'بروسيسر', 'cpu', 'processor'], icon: Cpu, required: true, multiple: false },
    { key: 'GPU', name: 'كرت الشاشة', nameVariants: ['كرت الشاشة', 'كروت الشاشة', 'كروت شاشة', 'كارت الشاشة', 'gpu', 'graphics card', 'vga'], icon: CircuitBoard, required: true, multiple: false },
    { key: 'MOTHERBOARD', name: 'اللوحة الأم', nameVariants: ['اللوحة الأم', 'اللوحات الأم', 'المذربورد', 'المذربوردات', 'motherboard'], icon: CircuitBoard, required: true, multiple: false },
    { key: 'RAM', name: 'الذاكرة العشوائية', nameVariants: ['الذاكرة العشوائية', 'الرامات', 'رام', 'ram', 'memory'], icon: HardDrive, required: true, multiple: true },
    { key: 'STORAGE', name: 'التخزين', nameVariants: ['التخزين', 'هارد', 'اس اس دي', 'storage', 'ssd', 'hdd'], icon: HardDrive, required: true, multiple: true },
    { key: 'CASE', name: 'الكيس', nameVariants: ['الكيس', 'كيس', 'كيسات', 'case'], icon: Box, required: false, multiple: false },
    { key: 'COOLING', name: 'التبريد', nameVariants: ['التبريد', 'مبرد', 'تبريد', 'مراوح', 'cooling', 'cooler'], icon: Fan, required: false, multiple: false },
];

const MULTI_CATEGORIES = ['RAM', 'STORAGE'];

export default function NewBundlePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [uploadedImage, setUploadedImage] = useState<UploadedImage[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<Record<string, any>>({});
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [saving, setSaving] = useState(false);
    const [discountAmount, setDiscountAmount] = useState<string>('');
    const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const buildSlugMap = async () => {
            try {
                const displayCategories = await adminApi.getDisplayCategories();
                const slugMap: Record<string, string> = {};

                for (const cat of CATEGORIES) {
                    const match = displayCategories.find((dc: any) => {
                        const dcNameLower = dc.name?.toLowerCase() || '';
                        const dcNameArLower = dc.nameAr?.toLowerCase() || '';
                        const dcSlugLower = dc.slug?.toLowerCase() || '';
                        return cat.nameVariants.some(variant => {
                            const variantLower = variant.toLowerCase();
                            return dcNameLower === variantLower ||
                                dcNameArLower === variantLower ||
                                dcSlugLower === variantLower ||
                                dcNameLower.includes(variantLower) ||
                                dcNameArLower.includes(variantLower) ||
                                variantLower.includes(dcNameLower) ||
                                variantLower.includes(dcNameArLower);
                        });
                    });

                    if (match) {
                        slugMap[cat.key] = match.slug;
                    } else {
                        slugMap[cat.key] = cat.key;
                    }
                }
                setCategorySlugMap(slugMap);
            } catch (error) {
                console.error('Failed to fetch display categories:', error);
                const fallback: Record<string, string> = {};
                CATEGORIES.forEach(cat => { fallback[cat.key] = cat.key; });
                setCategorySlugMap(fallback);
            }
        };

        buildSlugMap();
    }, []);

    useEffect(() => {
        if (activeCategory) {
            fetchProducts(activeCategory);
            setSearchQuery('');
            setSelectedBrand('');
        }
    }, [activeCategory]);

    const fetchProducts = async (categoryKey: string) => {
        setLoadingProducts(true);
        try {
            // Use the slug from the map, or fallback to key if not found (should be in map though)
            const categorySlug = categorySlugMap[categoryKey] || categoryKey;
            const data = await adminApi.getProducts({ category: categorySlug, limit: 100 });
            setProducts(data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSelectComponent = (product: any) => {
        if (!activeCategory) return;
        const isMultiple = MULTI_CATEGORIES.includes(activeCategory);

        setSelectedComponents(prev => {
            if (isMultiple) {
                const existing = prev[activeCategory];
                const existingArray = Array.isArray(existing) ? existing : existing ? [existing] : [];
                return {
                    ...prev,
                    [activeCategory]: [...existingArray, product]
                };
            } else {
                return {
                    ...prev,
                    [activeCategory]: product
                };
            }
        });

        if (!isMultiple) {
            setActiveCategory(null);
            setProducts([]);
            setSearchQuery('');
            setSelectedBrand('');
        }
    };

    const removeComponent = (category: string, index?: number) => {
        setSelectedComponents(prev => {
            if (MULTI_CATEGORIES.includes(category) && Array.isArray(prev[category])) {
                if (index !== undefined) {
                    const filtered = prev[category].filter((_: any, i: number) => i !== index);
                    const newComps = { ...prev };
                    if (filtered.length === 0) {
                        delete newComps[category];
                    } else {
                        newComps[category] = filtered;
                    }
                    return newComps;
                }
            }
            const newComps = { ...prev };
            delete newComps[category];
            return newComps;
        });
    };

    const getCategoryItems = (category: string): any[] => {
        const items = selectedComponents[category];
        if (!items) return [];
        return Array.isArray(items) ? items : [items];
    };

    const handleSave = async () => {
        if (!name) return alert('الرجاء إدخال اسم التجميعة');

        const componentsMap = new Map<string, { category: string, productId: string, quantity: number }>();

        Object.entries(selectedComponents).forEach(([categoryKey, value]) => {
            if (Array.isArray(value)) {
                value.forEach((product: any) => {
                    const existing = componentsMap.get(product.id);
                    if (existing) {
                        existing.quantity += 1;
                    } else {
                        componentsMap.set(product.id, {
                            category: categoryKey,
                            productId: product.id,
                            quantity: 1
                        });
                    }
                });
            } else if (value) {
                const existing = componentsMap.get(value.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    componentsMap.set(value.id, {
                        category: categoryKey,
                        productId: value.id,
                        quantity: 1
                    });
                }
            }
        });

        const components = Array.from(componentsMap.values());

        if (components.length === 0) return alert('الرجاء اختيار قطع للتجميعة');

        setSaving(true);
        try {
            const imageUrl = uploadedImage.length > 0 ? uploadedImage[0].url : undefined;
            await adminApi.createBuild({
                name,
                description,
                imageUrl,
                components,
                isTemplate: true,
                discountAmount: discountAmount ? Number(discountAmount) : undefined,
            });
            router.push('/bundles');
        } catch (error) {
            console.error('Error saving bundle:', error);
            alert('فشل حفظ التجميعة');
        } finally {
            setSaving(false);
        }
    };

    const getBrands = () => {
        const brands = new Set(products.map((p: any) => p.brand));
        return Array.from(brands).sort();
    };

    // Compatibility detection helpers
    const getPlatform = (product: any): string | null => {
        if (product.platform) return product.platform.toLowerCase();
        const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
        if (['intel', ' i3', ' i5', ' i7', ' i9', 'lga 1700', 'lga 1200', 'core i'].some(p => text.includes(p))) return 'intel';
        if (['amd', 'ryzen', 'am4', 'am5', 'threadripper'].some(p => text.includes(p))) return 'amd';
        return null;
    };

    const getSocketTypes = (product: any): string[] => {
        const raw = product.socketType;
        if (!raw) return [];
        return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    };

    const getMemoryTypes = (product: any): string[] => {
        const raw = product.memoryType;
        if (raw) return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
        const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
        if (text.includes('ddr5') && !text.includes('ddr4')) return ['ddr5'];
        if (text.includes('ddr4') && !text.includes('ddr5')) return ['ddr4'];
        return [];
    };

    const hasOverlap = (a: string[], b: string[]): boolean => a.some(val => b.includes(val));

    const filteredProducts = products.filter(p => {
        const matchesBrand = !selectedBrand || p.brand === selectedBrand;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesBrand || !matchesSearch) return false;

        if (activeCategory === 'MOTHERBOARD') {
            const cpu = selectedComponents['CPU'];
            if (cpu && !Array.isArray(cpu)) {
                const cpuPlatform = getPlatform(cpu);
                if (cpuPlatform) {
                    const mbPlatform = getPlatform(p);
                    if (!mbPlatform || mbPlatform !== cpuPlatform) return false;
                }
                const cpuSockets = getSocketTypes(cpu);
                if (cpuSockets.length > 0) {
                    const mbSockets = getSocketTypes(p);
                    if (!hasOverlap(cpuSockets, mbSockets)) return false;
                }
            }
            const ram = selectedComponents['RAM'];
            const ramItems = Array.isArray(ram) ? ram : ram ? [ram] : [];
            if (ramItems.length > 0) {
                const ramMemTypes = getMemoryTypes(ramItems[0]);
                if (ramMemTypes.length > 0) {
                    const mbMemTypes = getMemoryTypes(p);
                    if (!hasOverlap(ramMemTypes, mbMemTypes)) return false;
                }
            }
        }

        if (activeCategory === 'CPU') {
            const mb = selectedComponents['MOTHERBOARD'];
            if (mb && !Array.isArray(mb)) {
                const mbPlatform = getPlatform(mb);
                if (mbPlatform) {
                    const cpuPlatform = getPlatform(p);
                    if (!cpuPlatform || cpuPlatform !== mbPlatform) return false;
                }
                const mbSockets = getSocketTypes(mb);
                if (mbSockets.length > 0) {
                    const cpuSockets = getSocketTypes(p);
                    if (!hasOverlap(mbSockets, cpuSockets)) return false;
                }
            }
        }

        if (activeCategory === 'RAM') {
            const mb = selectedComponents['MOTHERBOARD'];
            if (mb && !Array.isArray(mb)) {
                const mbMemTypes = getMemoryTypes(mb);
                if (mbMemTypes.length > 0) {
                    const ramMemTypes = getMemoryTypes(p);
                    if (!hasOverlap(mbMemTypes, ramMemTypes)) return false;
                }
            } else {
                const cpu = selectedComponents['CPU'];
                if (cpu && !Array.isArray(cpu)) {
                    const cpuMemTypes = getMemoryTypes(cpu);
                    if (cpuMemTypes.length > 0) {
                        const ramMemTypes = getMemoryTypes(p);
                        if (!hasOverlap(cpuMemTypes, ramMemTypes)) return false;
                    }
                }
            }
        }

        return true;
    });

    const getAllProducts = (): any[] => {
        return Object.values(selectedComponents)
            .filter(Boolean)
            .flatMap(item => Array.isArray(item) ? item : [item]);
    };

    const totalPrice = getAllProducts().reduce((sum, p) => sum + Number(p.price), 0);

    const calculateTotalPower = () => {
        return Object.entries(selectedComponents)
            .filter(([category, item]) => item !== null && category !== 'PSU')
            .flatMap(([_, item]) => Array.isArray(item) ? item : [item])
            .reduce((sum, product) => sum + Number(product?.powerConsumption || 0), 0);
    };

    const getPSUCapacity = () => {
        const psu = selectedComponents['PSU'];
        if (!psu || Array.isArray(psu)) return 0;
        return Number(psu.powerConsumption || 0);
    };

    const getPowerUsagePercentage = () => {
        const psuCapacity = getPSUCapacity();
        if (psuCapacity === 0) return 0;
        return Math.min(100, Math.round((calculateTotalPower() / psuCapacity) * 100));
    };

    const getPowerStatusColor = () => {
        const percentage = getPowerUsagePercentage();
        if (percentage <= 60) return 'bg-green-500';
        if (percentage <= 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const hasRequiredComponents = () => {
        return CATEGORIES
            .filter(cat => cat.required)
            .every(cat => {
                const component = selectedComponents[cat.key];
                if (Array.isArray(component)) return component.length > 0;
                return !!component;
            });
    };

    return (
        <div className="flex min-h-screen bg-gray-100" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64">
                <Header title="إضافة تجميعة جديدة" />

                <div className="p-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowRight className="h-5 w-5" />
                        <span>رجوع</span>
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4">معلومات التجميعة</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم التجميعة</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                            placeholder="مثال: تجميعة الألعاب الاحترافية"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                                            placeholder="وصف مختصر للتجميعة..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">صورة التجميعة</label>
                                        <ImageUpload
                                            multiple={false}
                                            value={uploadedImage}
                                            onChange={setUploadedImage}
                                            maxFiles={1}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Components Selection */}
                            <div className="space-y-4">
                                {CATEGORIES.map((category) => {
                                    const Icon = category.icon;
                                    const categoryItems = getCategoryItems(category.key);
                                    const isSelecting = activeCategory === category.key;
                                    const isMultiple = category.multiple;

                                    return (
                                        <div key={category.key} className="bg-white rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                        <Icon className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <h3 className="text-lg font-bold">{category.name}</h3>
                                                    {category.required && (
                                                        <span className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded">
                                                            مطلوب
                                                        </span>
                                                    )}
                                                    {isMultiple && (
                                                        <span className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded">
                                                            متعدد
                                                        </span>
                                                    )}
                                                </div>
                                                {categoryItems.length > 0 && !isSelecting && !isMultiple && (
                                                    <button
                                                        onClick={() => removeComponent(category.key)}
                                                        className="text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>

                                            {isSelecting ? (
                                                <div className="space-y-4">
                                                    {/* Search and Filter */}
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="ابحث عن قطعة..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <select
                                                            value={selectedBrand}
                                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                                            className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                        >
                                                            <option value="">جميع البراندات</option>
                                                            {getBrands().map(brand => (
                                                                <option key={brand} value={brand}>{brand}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Products List */}
                                                    {loadingProducts ? (
                                                        <div className="text-center py-6">
                                                            <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="max-h-80 overflow-y-auto space-y-2">
                                                            {filteredProducts.map(product => {
                                                                const isSelected = Array.isArray(selectedComponents[activeCategory!])
                                                                    ? (selectedComponents[activeCategory!] as any[]).some(p => p.id === product.id)
                                                                    : (selectedComponents[activeCategory!] as any)?.id === product.id;

                                                                return (
                                                                    <button
                                                                        key={product.id}
                                                                        onClick={() => handleSelectComponent(product)}
                                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors border ${isSelected
                                                                            ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                                                                            : 'hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                                                                            }`}
                                                                    >
                                                                        {product.images && product.images[0] && (
                                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                <img
                                                                                    src={product.images[0]}
                                                                                    alt={product.name}
                                                                                    className="w-full h-full object-contain p-1"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-medium truncate">{product.name}</div>
                                                                            <div className="text-xs text-gray-500">{product.brand}</div>
                                                                        </div>
                                                                        <div className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                                                                            {Number(product.price).toLocaleString()} د.ع
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                            {filteredProducts.length === 0 && (
                                                                <div className="text-center py-6 text-gray-500">لا توجد نتائج</div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => { setActiveCategory(null); setProducts([]); setSearchQuery(''); setSelectedBrand(''); }}
                                                        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            ) : categoryItems.length > 0 ? (
                                                <div className="space-y-3">
                                                    {categoryItems.map((product, index) => (
                                                        <div key={`${product.id}-${index}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                            {product.images && product.images[0] && (
                                                                <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                                    <img
                                                                        src={product.images[0]}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-contain p-1"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm truncate">{product.name}</p>
                                                                <p className="text-xs text-gray-500">{product.brand}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">
                                                                    {Number(product.price).toLocaleString()} د.ع
                                                                </span>
                                                                <button
                                                                    onClick={() => removeComponent(category.key, isMultiple ? index : undefined)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="إزالة"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Change button for single categories */}
                                                    {!isMultiple && (
                                                        <button
                                                            onClick={() => setActiveCategory(category.key)}
                                                            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            تغيير
                                                        </button>
                                                    )}
                                                    {/* Add more button for multi-select categories */}
                                                    {isMultiple && (
                                                        <button
                                                            onClick={() => setActiveCategory(category.key)}
                                                            className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-lg transition-colors text-gray-400 hover:text-emerald-600 text-sm"
                                                        >
                                                            + إضافة {category.name} آخر
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveCategory(category.key)}
                                                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-lg transition-colors text-gray-400 hover:text-emerald-600"
                                                >
                                                    + اختر {category.name}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
                                <h3 className="font-bold text-lg mb-4">ملخص التجميعة</h3>

                                {/* Image preview */}
                                {uploadedImage.length > 0 && (
                                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={uploadedImage[0].url}
                                            alt="صورة التجميعة"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                )}

                                {!hasRequiredComponents() && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-500">
                                            يجب اختيار جميع القطع المطلوبة
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">عدد القطع:</span>
                                        <span className="font-semibold">{getAllProducts().length} قطع</span>
                                    </div>

                                    {/* Power Usage Bar */}
                                    {(calculateTotalPower() > 0 || getPSUCapacity() > 0) && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">استهلاك الطاقة:</span>
                                                <span className="font-semibold">
                                                    {calculateTotalPower()}W / {getPSUCapacity() > 0 ? `${getPSUCapacity()}W` : 'لم يتم اختيار PSU'}
                                                </span>
                                            </div>
                                            {getPSUCapacity() > 0 && (
                                                <div className="relative">
                                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${getPowerStatusColor()}`}
                                                            style={{ width: `${getPowerUsagePercentage()}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs mt-1">
                                                        <span className={`${getPowerUsagePercentage() > 80 ? 'text-red-500' : 'text-gray-400'}`}>
                                                            {getPowerUsagePercentage()}% مستخدم
                                                        </span>
                                                        {getPowerUsagePercentage() > 80 && (
                                                            <span className="text-red-500">تحذير</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">السعر الأصلي:</span>
                                            <span className={`text-xl font-bold ${discountAmount && Number(discountAmount) > 0 ? 'line-through text-gray-400' : 'text-emerald-600'}`}>
                                                {totalPrice.toLocaleString()} د.ع
                                            </span>
                                        </div>
                                        {discountAmount && Number(discountAmount) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-green-600">بعد الخصم:</span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {Math.max(0, totalPrice - Number(discountAmount)).toLocaleString()} د.ع
                                                </span>
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">خصم ثابت (د.ع)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={discountAmount}
                                                onChange={(e) => setDiscountAmount(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-5 w-5" />
                                        {saving ? 'جاري الحفظ...' : 'حفظ التجميعة'}
                                    </button>
                                    <button
                                        onClick={() => router.back()}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
