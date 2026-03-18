'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
    ChevronDown, ChevronUp, Cpu, CircuitBoard, MemoryStick,
    Search, Plus, X, AlertTriangle, ExternalLink, Settings
} from 'lucide-react';
import Link from 'next/link';

const COMPAT_CATEGORIES = [
    { key: 'CPU', name: 'المعالجات', nameVariants: ['المعالج', 'المعالجات', 'بروسيسر', 'cpu', 'processor'], icon: Cpu, color: 'bg-blue-500' },
    { key: 'MOTHERBOARD', name: 'اللوحات الأم', nameVariants: ['اللوحة الأم', 'اللوحات الأم', 'المذربورد', 'المذربوردات', 'motherboard'], icon: CircuitBoard, color: 'bg-green-500' },
    { key: 'RAM', name: 'الذاكرة العشوائية', nameVariants: ['الذاكرة العشوائية', 'الرامات', 'رام', 'ram', 'memory'], icon: MemoryStick, color: 'bg-teal-500' },
];

const SOCKET_PRESETS_KEY = 'compat_socket_presets';
const MEMORY_PRESETS_KEY = 'compat_memory_presets';
const DEFAULT_SOCKET_PRESETS = ['LGA 1700', 'LGA 1200', 'AM5', 'AM4', 'TR4', 'sTRX4'];
const DEFAULT_MEMORY_PRESETS = ['DDR4', 'DDR5'];

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    images?: string[];
    specifications?: Record<string, any>;
    stock: number;
    platform?: string | null;
    socketType?: string | null;
    memoryType?: string | null;
}

// Fallback keyword detection (used when DB fields are empty)
function detectPlatformFallback(product: Product): 'intel' | 'amd' | null {
    const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
    const isIntel = ['intel', ' i3', ' i5', ' i7', ' i9', 'lga 1700', 'lga 1200', 'lga1700', 'lga1200', 'core i'].some(p => text.includes(p));
    const isAMD = ['amd', 'ryzen', 'am4', 'am5', 'threadripper'].some(p => text.includes(p));
    if (isIntel && !isAMD) return 'intel';
    if (isAMD && !isIntel) return 'amd';
    return null;
}

function detectDDRFallback(product: Product): 'ddr4' | 'ddr5' | null {
    const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
    if (text.includes('ddr5') && !text.includes('ddr4')) return 'ddr5';
    if (text.includes('ddr4') && !text.includes('ddr5')) return 'ddr4';
    return null;
}

// Use actual DB field first, fall back to keyword detection
function getProductPlatform(product: Product): { value: string | null; fromField: boolean } {
    if (product.platform) return { value: product.platform.toLowerCase(), fromField: true };
    const detected = detectPlatformFallback(product);
    return { value: detected, fromField: false };
}

function getProductSockets(product: Product): string[] {
    if (!product.socketType) return [];
    return product.socketType.split(',').map(s => s.trim()).filter(Boolean);
}

function getProductMemTypes(product: Product): { values: string[]; fromField: boolean } {
    if (product.memoryType) {
        return { values: product.memoryType.split(',').map(s => s.trim()).filter(Boolean), fromField: true };
    }
    const ddr = detectDDRFallback(product);
    return { values: ddr ? [ddr.toUpperCase()] : [], fromField: false };
}

function hasMissingData(product: Product, category: string): boolean {
    if (category === 'CPU' || category === 'MOTHERBOARD') {
        if (!product.platform && !detectPlatformFallback(product)) return true;
        if (!product.socketType) return true;
    }
    if (category === 'MOTHERBOARD' || category === 'RAM') {
        if (!product.memoryType && !detectDDRFallback(product)) return true;
    }
    return false;
}

function PlatformBadge({ product }: { product: Product }) {
    const { value, fromField } = getProductPlatform(product);
    if (!value) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400">غير محدد</span>;
    const isIntel = value === 'intel';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isIntel ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            {isIntel ? '🔵' : '🔴'} {isIntel ? 'Intel' : 'AMD'}
            {!fromField && <span className="opacity-60 text-[10px]">(تلقائي)</span>}
        </span>
    );
}

function SocketBadges({ product }: { product: Product }) {
    const sockets = getProductSockets(product);
    if (sockets.length === 0) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-500">⚠ غير محدد</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {sockets.map(s => (
                <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{s}</span>
            ))}
        </div>
    );
}

function MemoryBadges({ product }: { product: Product }) {
    const { values, fromField } = getProductMemTypes(product);
    if (values.length === 0) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-500">⚠ غير محدد</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {values.map(v => (
                <span key={v} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${!fromField ? 'opacity-70' : ''} ${v.toLowerCase() === 'ddr5' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {v}{!fromField && ' (تلقائي)'}
                </span>
            ))}
        </div>
    );
}

export default function CompatibilityPage() {
    const [products, setProducts] = useState<Record<string, Product[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('CPU');
    const [searchQuery, setSearchQuery] = useState('');
    const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>({});

    // Preset management
    const [socketPresets, setSocketPresets] = useState<string[]>(DEFAULT_SOCKET_PRESETS);
    const [memoryPresets, setMemoryPresets] = useState<string[]>(DEFAULT_MEMORY_PRESETS);
    const [newSocketPreset, setNewSocketPreset] = useState('');
    const [newMemoryPreset, setNewMemoryPreset] = useState('');

    // Load presets from localStorage on mount
    useEffect(() => {
        try {
            const sockets = localStorage.getItem(SOCKET_PRESETS_KEY);
            if (sockets) setSocketPresets(JSON.parse(sockets));
            const mems = localStorage.getItem(MEMORY_PRESETS_KEY);
            if (mems) setMemoryPresets(JSON.parse(mems));
        } catch { /* keep defaults */ }
    }, []);

    const addSocketPreset = () => {
        const val = newSocketPreset.trim();
        if (!val || socketPresets.includes(val)) return;
        const updated = [...socketPresets, val];
        setSocketPresets(updated);
        localStorage.setItem(SOCKET_PRESETS_KEY, JSON.stringify(updated));
        setNewSocketPreset('');
    };

    const removeSocketPreset = (socket: string) => {
        const updated = socketPresets.filter(s => s !== socket);
        setSocketPresets(updated);
        localStorage.setItem(SOCKET_PRESETS_KEY, JSON.stringify(updated));
    };

    const addMemoryPreset = () => {
        const val = newMemoryPreset.trim();
        if (!val || memoryPresets.includes(val)) return;
        const updated = [...memoryPresets, val];
        setMemoryPresets(updated);
        localStorage.setItem(MEMORY_PRESETS_KEY, JSON.stringify(updated));
        setNewMemoryPreset('');
    };

    const removeMemoryPreset = (mem: string) => {
        const updated = memoryPresets.filter(m => m !== mem);
        setMemoryPresets(updated);
        localStorage.setItem(MEMORY_PRESETS_KEY, JSON.stringify(updated));
    };

    // Build category slug map
    useEffect(() => {
        const buildSlugMap = async () => {
            try {
                const displayCategories = await adminApi.getDisplayCategories();
                const slugMap: Record<string, string> = {};
                for (const cat of COMPAT_CATEGORIES) {
                    const match = displayCategories.find((dc: any) => {
                        const dcNameLower = dc.name?.toLowerCase() || '';
                        const dcNameArLower = dc.nameAr?.toLowerCase() || '';
                        const dcSlugLower = dc.slug?.toLowerCase() || '';
                        return cat.nameVariants.some(variant => {
                            const v = variant.toLowerCase();
                            return dcNameLower === v || dcNameArLower === v || dcSlugLower === v ||
                                dcNameLower.includes(v) || dcNameArLower.includes(v) ||
                                v.includes(dcNameLower) || v.includes(dcNameArLower);
                        });
                    });
                    slugMap[cat.key] = match ? match.slug : cat.key;
                }
                setCategorySlugMap(slugMap);
            } catch {
                const fallback: Record<string, string> = {};
                COMPAT_CATEGORIES.forEach(cat => { fallback[cat.key] = cat.key; });
                setCategorySlugMap(fallback);
            }
        };
        buildSlugMap();
    }, []);

    // Fetch products once slug map is ready
    useEffect(() => {
        if (Object.keys(categorySlugMap).length === 0) return;
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const results: Record<string, Product[]> = {};
                for (const cat of COMPAT_CATEGORIES) {
                    const slug = categorySlugMap[cat.key];
                    try {
                        const response = await adminApi.getProducts({ category: slug, limit: 200 });
                        results[cat.key] = (response as any).data || (response as any) || [];
                    } catch {
                        results[cat.key] = [];
                    }
                }
                setProducts(results);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categorySlugMap]);

    // Compatible products using actual DB fields
    const getCompatibleProducts = (product: Product, targetCategory: string): Product[] => {
        const targetProducts = products[targetCategory] || [];
        const hasOverlap = (a: string[], b: string[]): boolean => a.some(v => b.includes(v));
        const pPlatform = getProductPlatform(product).value;
        const pSockets = getProductSockets(product).map(s => s.toLowerCase());
        const pMemTypes = getProductMemTypes(product).values.map(v => v.toLowerCase());

        return targetProducts.filter(target => {
            const tPlatform = getProductPlatform(target).value;
            const tSockets = getProductSockets(target).map(s => s.toLowerCase());
            const tMemTypes = getProductMemTypes(target).values.map(v => v.toLowerCase());

            // CPU <-> MOTHERBOARD: strict — source platform/socket must match target
            if ((activeTab === 'CPU' && targetCategory === 'MOTHERBOARD') ||
                (activeTab === 'MOTHERBOARD' && targetCategory === 'CPU')) {
                if (pPlatform) {
                    if (!tPlatform || tPlatform !== pPlatform) return false;
                }
                if (pSockets.length > 0) {
                    if (!hasOverlap(pSockets, tSockets)) return false;
                }
            }

            // MOTHERBOARD/CPU <-> RAM: strict — source memType must match target
            if ((activeTab === 'MOTHERBOARD' || activeTab === 'CPU') && targetCategory === 'RAM') {
                if (pMemTypes.length > 0) {
                    if (!hasOverlap(pMemTypes, tMemTypes)) return false;
                }
            }
            if (activeTab === 'RAM' && (targetCategory === 'MOTHERBOARD' || targetCategory === 'CPU')) {
                if (pMemTypes.length > 0) {
                    if (!hasOverlap(pMemTypes, tMemTypes)) return false;
                }
            }

            return true;
        });
    };

    const currentProducts = (products[activeTab] || []).filter(p =>
        !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const currentTab = COMPAT_CATEGORIES.find(c => c.key === activeTab)!;
    const missingCount = (products[activeTab] || []).filter(p => hasMissingData(p, activeTab)).length;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 mr-64">
                    <Header title="التوافق" />
                    <div className="p-6 flex items-center justify-center h-96">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64">
                <Header title="التوافق - إدارة توافق القطع" />

                <div className="p-6 space-y-6">

                    {/* Preset Management */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-bold text-gray-800">إعداد قيم التوافق</h3>
                            <span className="text-xs text-gray-500 mr-1">— تُستخدم كاقتراحات سريعة عند تعديل المنتجات</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Socket Types */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-800 mb-2">أنواع السوكت</label>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                                    {socketPresets.map(socket => (
                                        <span key={socket} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                            {socket}
                                            <button
                                                onClick={() => removeSocketPreset(socket)}
                                                className="p-0.5 hover:bg-blue-200 rounded"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSocketPreset}
                                        onChange={e => setNewSocketPreset(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSocketPreset(); } }}
                                        placeholder="مثال: LGA 1700، AM5"
                                        className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={addSocketPreset}
                                        className="px-3 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Memory Types */}
                            <div>
                                <label className="block text-sm font-semibold text-green-800 mb-2">أنواع الذاكرة</label>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                                    {memoryPresets.map(mem => (
                                        <span key={mem} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                            {mem}
                                            <button
                                                onClick={() => removeMemoryPreset(mem)}
                                                className="p-0.5 hover:bg-green-200 rounded"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMemoryPreset}
                                        onChange={e => setNewMemoryPreset(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMemoryPreset(); } }}
                                        placeholder="مثال: DDR4، DDR5"
                                        className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={addMemoryPreset}
                                        className="px-3 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-3">
                        {COMPAT_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const count = products[cat.key]?.length || 0;
                            const missing = (products[cat.key] || []).filter(p => hasMissingData(p, cat.key)).length;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => { setActiveTab(cat.key); setSearchQuery(''); setExpandedProduct(null); }}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${activeTab === cat.key
                                        ? `${cat.color} text-white shadow-lg`
                                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{cat.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === cat.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        {count}
                                    </span>
                                    {missing > 0 && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                                            {missing} ⚠
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Missing data warning */}
                    {missingCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">
                                    {missingCount} منتج بيانات توافق ناقصة في {currentTab.name}
                                </p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                    المنتجات التي لا تحتوي على بيانات لن تظهر في نتائج الفلترة. انقر على المنتج ثم "تعديل" لإضافة البيانات.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`بحث في ${currentTab.name}...`}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                        />
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">المنتج</th>
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">الماركة</th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">المنصة</th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">السوكت</th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">نوع الذاكرة</th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">متوافق مع</th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-400">
                                                لا توجد منتجات في هذا التصنيف
                                            </td>
                                        </tr>
                                    ) : (
                                        currentProducts.map(product => {
                                            const missing = hasMissingData(product, activeTab);
                                            const isExpanded = expandedProduct === product.id;
                                            const compatCategories = COMPAT_CATEGORIES.filter(c => c.key !== activeTab);
                                            const compatCounts: Record<string, number> = {};
                                            compatCategories.forEach(c => {
                                                compatCounts[c.key] = getCompatibleProducts(product, c.key).length;
                                            });
                                            const totalCompat = Object.values(compatCounts).reduce((a, b) => a + b, 0);

                                            return (
                                                <React.Fragment key={product.id}>
                                                    <tr
                                                        className={`transition-colors cursor-pointer ${isExpanded ? 'bg-emerald-50' : missing ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-emerald-50'}`}
                                                        onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {product.images?.[0] && (
                                                                    <img
                                                                        src={product.images[0]}
                                                                        alt={product.name}
                                                                        className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                                                                    />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <span className="font-medium text-gray-800 text-sm line-clamp-1">{product.name}</span>
                                                                    {missing && (
                                                                        <span className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                                                                            <AlertTriangle className="h-3 w-3" /> بيانات توافق ناقصة
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                                                        <td className="px-4 py-3 text-center"><PlatformBadge product={product} /></td>
                                                        <td className="px-4 py-3 text-center"><SocketBadges product={product} /></td>
                                                        <td className="px-4 py-3 text-center"><MemoryBadges product={product} /></td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${totalCompat > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {totalCompat} منتج
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Link
                                                                    href={`/products/${product.id}`}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                                    title="تعديل المنتج"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Link>
                                                                {isExpanded
                                                                    ? <ChevronUp className="h-4 w-4 text-gray-400" />
                                                                    : <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                }
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded compatibility detail */}
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-5 bg-emerald-50/60">
                                                                <div className="space-y-5">
                                                                    {compatCategories.map(compatCat => {
                                                                        const compatProducts = getCompatibleProducts(product, compatCat.key);
                                                                        const Icon = compatCat.icon;
                                                                        return (
                                                                            <div key={compatCat.key}>
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <Icon className="h-4 w-4 text-gray-500" />
                                                                                    <h4 className="font-semibold text-gray-700 text-sm">
                                                                                        {compatCat.name} المتوافقة
                                                                                        <span className="text-gray-400 font-normal mr-2">({compatProducts.length})</span>
                                                                                    </h4>
                                                                                </div>
                                                                                {compatProducts.length === 0 ? (
                                                                                    <p className="text-xs text-gray-400 mr-6">لا توجد منتجات متوافقة — تأكد من إدخال بيانات التوافق</p>
                                                                                ) : (
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                                        {compatProducts.slice(0, 9).map(cp => (
                                                                                            <div key={cp.id} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-100">
                                                                                                {cp.images?.[0] && (
                                                                                                    <img src={cp.images[0]} alt={cp.name} className="w-9 h-9 object-contain rounded flex-shrink-0" />
                                                                                                )}
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{cp.name}</p>
                                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                                        <PlatformBadge product={cp} />
                                                                                                        <SocketBadges product={cp} />
                                                                                                        <MemoryBadges product={cp} />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                        {compatProducts.length > 9 && (
                                                                                            <div className="flex items-center justify-center p-2 text-xs text-gray-400">
                                                                                                +{compatProducts.length - 9} منتجات أخرى
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
