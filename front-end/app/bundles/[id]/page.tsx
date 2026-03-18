'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Build, type Product, type Brand } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  ChevronLeft,
  Edit2,
  Cpu,
  CircuitBoard,
  HardDrive,
  Zap,
  Box,
  Fan,
  Search,
  ShoppingCart,
  RotateCcw,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuickView } from '@/contexts/QuickViewContext';

const CATEGORIES = [
  { key: 'PSU', name: 'مزود الطاقة', icon: Zap, required: true, multiple: false },
  { key: 'CPU', name: 'المعالج', icon: Cpu, required: true, multiple: false },
  { key: 'GPU', name: 'كرت الشاشة', icon: CircuitBoard, required: true, multiple: false },
  { key: 'MOTHERBOARD', name: 'اللوحة الأم', icon: CircuitBoard, required: true, multiple: false },
  { key: 'RAM', name: 'الذاكرة العشوائية', icon: HardDrive, required: true, multiple: true },
  { key: 'STORAGE', name: 'التخزين', icon: HardDrive, required: true, multiple: true },
  { key: 'CASE', name: 'الكيس', icon: Box, required: false, multiple: false },
  { key: 'COOLING', name: 'التبريد', icon: Fan, required: false, multiple: false },
];

const MULTI_CATEGORIES = ['RAM', 'STORAGE'];


export default function BundleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { openQuickView } = useQuickView();
  const [bundle, setBundle] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoryBrands, setCategoryBrands] = useState<Brand[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>({});

  // Local customizations - supports single and multi components
  const [customComponents, setCustomComponents] = useState<Record<string, Product | Product[]>>({});
  const [hasCustomizations, setHasCustomizations] = useState(false);

  // Build dynamic category slug map from display categories
  useEffect(() => {
    async function buildSlugMap() {
      try {
        const displayCategories = await api.getActiveDisplayCategories();
        const slugMap: Record<string, string> = {};
        for (const cat of CATEGORIES) {
          const match = displayCategories.find((dc: any) => {
            const dcNameLower = dc.name?.toLowerCase() || '';
            const dcNameArLower = dc.nameAr?.toLowerCase() || '';
            const dcSlugLower = dc.slug?.toLowerCase() || '';
            const catNameLower = cat.name.toLowerCase();
            const catKeyLower = cat.key.toLowerCase();
            return dcSlugLower === catKeyLower || dcNameLower === catNameLower ||
              dcNameArLower === catNameLower || dcNameLower.includes(catNameLower) ||
              dcNameArLower.includes(catNameLower) || catNameLower.includes(dcNameLower) ||
              catNameLower.includes(dcNameArLower);
          });
          slugMap[cat.key] = match ? match.slug : cat.key;
        }
        setCategorySlugMap(slugMap);
      } catch {
        const fallback: Record<string, string> = {};
        CATEGORIES.forEach(cat => { fallback[cat.key] = cat.key; });
        setCategorySlugMap(fallback);
      }
    }
    buildSlugMap();
  }, []);

  const resolveCategoryKey = (category: string): string => {
    if (CATEGORIES.some(c => c.key === category)) return category;
    for (const [key, slug] of Object.entries(categorySlugMap)) {
      if (slug.toLowerCase() === category.toLowerCase()) return key;
    }
    return category;
  };

  useEffect(() => {
    if (Object.keys(categorySlugMap).length === 0) return;
    async function loadBundle() {
      try {
        const data = await api.getBuild(params.id as string);
        setBundle(data);
        const initial: Record<string, Product | Product[]> = {};
        data.components.forEach((comp: any) => {
          const key = resolveCategoryKey(comp.category);
          if (MULTI_CATEGORIES.includes(key)) {
            if (!initial[key]) {
              initial[key] = [];
            }
            (initial[key] as Product[]).push(comp.product);
          } else {
            initial[key] = comp.product;
          }
        });
        setCustomComponents(initial);
      } catch (error) {
        console.error('Failed to load bundle:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBundle();
  }, [params.id, categorySlugMap]);

  const startEditing = async (category: string) => {
    setEditingCategory(category);
    setProductsLoading(true);
    setSelectedBrand('');
    setSearchQuery('');

    const categorySlug = categorySlugMap[category] || category;

    try {
      const response = await api.getProducts({ category: categorySlug, limit: 100 });
      setAvailableProducts(response.data);
      try {
        const brandsData = await api.getBrandsByCategory(categorySlug);
        setCategoryBrands(brandsData);
      } catch {
        const allBrands = await api.getBrands();
        setCategoryBrands(allBrands);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const selectComponent = (product: Product) => {
    if (!editingCategory) return;
    const isMultiple = MULTI_CATEGORIES.includes(editingCategory);

    if (isMultiple) {
      const existing = customComponents[editingCategory];
      const existingArray = Array.isArray(existing) ? existing : existing ? [existing] : [];
      const currentCount = existingArray.filter(p => p.id === product.id).length;
      if (currentCount >= product.stock) {
        toast.error(`الكمية المتوفرة من "${product.name}" هي ${product.stock} فقط`);
        return;
      }
    }

    setCustomComponents(prev => {
      if (isMultiple) {
        const existing = prev[editingCategory];
        const existingArray = Array.isArray(existing) ? existing : existing ? [existing] : [];
        return {
          ...prev,
          [editingCategory]: [...existingArray, product]
        };
      } else {
        return {
          ...prev,
          [editingCategory]: product
        };
      }
    });

    setHasCustomizations(true);
    toast.success(`تمت إضافة "${product.name}"`, { duration: 2000 });

    if (!isMultiple) {
      setEditingCategory(null);
    }
  };

  const removeComponent = (category: string, index?: number) => {
    setCustomComponents(prev => {
      if (MULTI_CATEGORIES.includes(category) && Array.isArray(prev[category])) {
        if (index !== undefined) {
          const filtered = (prev[category] as Product[]).filter((_, i) => i !== index);
          return {
            ...prev,
            [category]: filtered.length > 0 ? filtered : []
          };
        }
      }
      const newComps = { ...prev };
      delete newComps[category];
      return newComps;
    });
    setHasCustomizations(true);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setAvailableProducts([]);
    setSelectedBrand('');
    setSearchQuery('');
  };

  const resetCustomizations = () => {
    if (!bundle) return;
    const initial: Record<string, Product | Product[]> = {};
    bundle.components.forEach((comp: any) => {
      const key = resolveCategoryKey(comp.category);
      if (MULTI_CATEGORIES.includes(key)) {
        if (!initial[key]) {
          initial[key] = [];
        }
        (initial[key] as Product[]).push(comp.product);
      } else {
        initial[key] = comp.product;
      }
    });
    setCustomComponents(initial);
    setHasCustomizations(false);
    toast.info('تم إعادة التجميعة للأصلية');
  };

  const getBrands = () => {
    if (categoryBrands.length > 0) {
      return categoryBrands.map(b => b.name).sort();
    }
    const brands = new Set(availableProducts.map(p => p.brand));
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

  const getFilteredProducts = () => {
    return availableProducts.filter(p => {
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesBrand || !matchesSearch) return false;

      if (editingCategory === 'MOTHERBOARD') {
        const cpu = customComponents['CPU'];
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
        const ram = customComponents['RAM'];
        const ramItems = Array.isArray(ram) ? ram : ram ? [ram] : [];
        if (ramItems.length > 0) {
          const ramMemTypes = getMemoryTypes(ramItems[0]);
          if (ramMemTypes.length > 0) {
            const mbMemTypes = getMemoryTypes(p);
            if (!hasOverlap(ramMemTypes, mbMemTypes)) return false;
          }
        }
      }

      if (editingCategory === 'CPU') {
        const mb = customComponents['MOTHERBOARD'];
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

      if (editingCategory === 'RAM') {
        const mb = customComponents['MOTHERBOARD'];
        if (mb && !Array.isArray(mb)) {
          const mbMemTypes = getMemoryTypes(mb);
          if (mbMemTypes.length > 0) {
            const ramMemTypes = getMemoryTypes(p);
            if (!hasOverlap(mbMemTypes, ramMemTypes)) return false;
          }
        } else {
          const cpu = customComponents['CPU'];
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
  };

  const getCategoryItems = (category: string): Product[] => {
    const items = customComponents[category];
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  };

  const getAllProducts = (): Product[] => {
    return Object.values(customComponents)
      .filter(Boolean)
      .flatMap(item => Array.isArray(item) ? item : [item as Product]);
  };

  const calculateTotalPrice = () => {
    return getAllProducts().reduce((sum, product) => sum + Number(product.price), 0);
  };

  const calculateTotalPower = () => {
    return Object.entries(customComponents)
      .filter(([category]) => category !== 'PSU')
      .flatMap(([_, item]) => Array.isArray(item) ? item : [item as Product])
      .reduce((sum, product) => sum + Number(product?.powerConsumption || 0), 0);
  };

  const getPSUCapacity = () => {
    const psu = customComponents['PSU'];
    if (!psu || Array.isArray(psu)) return 0;
    return Number(psu.powerConsumption || 0);
  };

  const getPowerUsagePercentage = () => {
    const psuCapacity = getPSUCapacity();
    if (psuCapacity === 0) return 0;
    return Math.min(100, Math.round((calculateTotalPower() / psuCapacity) * 100));
  };

  const getOriginalPrice = () => {
    if (!bundle) return 0;
    return bundle.components.reduce((sum, comp) => sum + Number(comp.product.price), 0);
  };

  const getPriceDifference = () => {
    return calculateTotalPrice() - getOriginalPrice();
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      const bundleDiscount = !hasCustomizations && bundle?.discountAmount ? Number(bundle.discountAmount) : 0;
      await api.addBuildToCart(customComponents, bundleDiscount > 0 ? bundleDiscount : undefined);

      toast.success('تمت إضافة التجميعة للسلة');
      router.push('/cart');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
        toast.error('يجب تسجيل الدخول لإضافة المنتجات للسلة');
        router.push('/account');
      } else {
        toast.error('فشل إضافة التجميعة للسلة');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-5 xl:col-span-6">
              <div className="aspect-square bg-card rounded-3xl" />
            </div>
            <div className="lg:col-span-7 xl:col-span-6 space-y-6">
              <div className="bg-secondary h-10 rounded w-2/3" />
              <div className="bg-secondary h-6 rounded w-full" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card h-20 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">لم يتم العثور على التجميعة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ===== RIGHT COLUMN - PC Preview (sticky) ===== */}
          <section className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-24 order-1 lg:order-2 space-y-6">
            {/* Main Image */}
            <div className="bg-card rounded-3xl overflow-hidden border border-border aspect-square flex items-center justify-center p-8">
              {bundle.imageUrl ? (
                <img
                  src={bundle.imageUrl}
                  alt={bundle.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground">
                  <Box className="h-32 w-32" />
                </div>
              )}
            </div>
          </section>

          {/* ===== LEFT COLUMN - Details & Customization ===== */}
          <section className="lg:col-span-7 xl:col-span-6 space-y-8 order-2 lg:order-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/bundles" className="hover:text-primary transition-colors">التجميعات</a>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-foreground">{bundle.name}</span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{bundle.name}</h2>
              {bundle.description && (
                <p className="text-muted-foreground leading-relaxed text-lg">{bundle.description}</p>
              )}
            </div>

            {hasCustomizations && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md p-4">
                <span className="text-primary text-sm">لقد قمت بتخصيص هذه التجميعة. التغييرات ستُحفظ عند الإضافة للسلة.</span>
                <button
                  onClick={resetCustomizations}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  إعادة
                </button>
              </div>
            )}

            {/* Customization List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span>تخصيص المكونات</span>
                <span className="h-px bg-border flex-grow" />
              </h3>

              {CATEGORIES.map((category) => {
                const categoryItems = getCategoryItems(category.key);
                const isEditing = editingCategory === category.key;
                const isMultiple = category.multiple;

                return (
                  <div key={category.key}>
                    {isEditing ? (
                      /* ===== EDITING STATE ===== */
                      <div className="p-5 bg-card border border-[#06c6a1]/30 rounded-md space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold" style={{ color: '#06c6a1' }}>{category.name}</h4>
                          <button
                            onClick={cancelEditing}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="ابحث عن قطعة..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pr-10 pl-4 py-2.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#06c6a1] focus:border-transparent"
                            />
                          </div>
                          <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="px-4 py-2.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#06c6a1]"
                          >
                            <option value="">جميع البراندات</option>
                            {getBrands().map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>

                        {/* Products List */}
                        {productsLoading ? (
                          <div className="text-center py-6">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                            {getFilteredProducts().map(product => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-3 bg-secondary hover:bg-[#06c6a1]/10 rounded-md transition-colors cursor-pointer"
                                onClick={() => selectComponent(product)}
                              >
                                {product.images && product.images[0] && (
                                  <div
                                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary border border-border cursor-pointer hover:border-[#06c6a1] transition-colors"
                                    onClick={(e) => { e.stopPropagation(); openQuickView(product); }}
                                  >
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-1"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 text-right">
                                  <p className="font-medium text-sm truncate">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openQuickView(product);
                                  }}
                                  className="p-1.5 text-muted-foreground hover:text-[#06c6a1] rounded-lg transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <span className="text-primary font-bold text-sm whitespace-nowrap">
                                  {formatPrice(product.price)} د.ع
                                </span>
                              </div>
                            ))}
                            {getFilteredProducts().length === 0 && (
                              <p className="text-center text-muted-foreground py-6 text-sm">لا توجد قطع متاحة</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : categoryItems.length > 0 ? (
                      /* ===== COMPONENT DISPLAY STATE ===== */
                      <div className="space-y-2">
                        {categoryItems.map((product, index) => (
                          <div
                            key={`${product.id}-${index}`}
                            className="p-4 bg-card border border-border rounded-md flex items-center justify-between hover:border-[#06c6a1]/30 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center p-2 flex-shrink-0 border border-border">
                                {product.images && product.images[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-contain cursor-pointer"
                                    onClick={() => openQuickView(product)}
                                  />
                                ) : (
                                  <category.icon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold block uppercase mb-0.5" style={{ color: '#06c6a1' }}>{category.name}</span>
                                <p className="font-medium text-sm truncate">{product.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                              <button
                                onClick={() => openQuickView(product)}
                                className="p-1.5 text-muted-foreground hover:text-[#06c6a1] rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {isMultiple && (
                                <button
                                  onClick={() => removeComponent(category.key, index)}
                                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              {!isMultiple && (
                                <button
                                  onClick={() => startEditing(category.key)}
                                  className="px-5 py-2 text-white text-sm font-bold rounded-lg transition-colors hover:opacity-90"
                                  style={{ backgroundColor: '#06c6a1' }}
                                >
                                  تغيير
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {isMultiple && (
                          <button
                            onClick={() => startEditing(category.key)}
                            className="w-full py-3 border border-dashed border-border hover:border-[#06c6a1] rounded-md transition-colors text-muted-foreground hover:text-[#06c6a1] text-sm"
                          >
                            + إضافة {category.name} آخر
                          </button>
                        )}
                      </div>
                    ) : (
                      /* ===== EMPTY STATE ===== */
                      <button
                        onClick={() => startEditing(category.key)}
                        className="w-full p-4 bg-card border border-dashed border-border hover:border-[#06c6a1] rounded-md transition-colors text-muted-foreground hover:text-[#06c6a1] flex items-center justify-center gap-2"
                      >
                        <category.icon className="h-5 w-5" />
                        + إضافة {category.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ===== Summary Card ===== */}
            <div className="p-6 md:p-8 bg-card rounded-3xl border space-y-6" style={{ borderColor: 'rgba(6, 198, 161, 0.2)' }}>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">إجمالي السعر</p>
                  {bundle.discountAmount && Number(bundle.discountAmount) > 0 && !hasCustomizations ? (
                    <>
                      <span className="text-sm text-muted-foreground line-through block">
                        {formatPrice(calculateTotalPrice())} د.ع
                      </span>
                      <h4 className="text-3xl font-bold text-green-500">
                        {formatPrice(calculateTotalPrice() - Number(bundle.discountAmount))} <span className="text-lg font-normal text-muted-foreground">د.ع</span>
                      </h4>
                      <span className="text-xs text-green-600 font-medium">
                        وفّرت {formatPrice(Number(bundle.discountAmount))} د.ع
                      </span>
                    </>
                  ) : (
                    <h4 className="text-3xl font-bold text-foreground">
                      {formatPrice(calculateTotalPrice())} <span className="text-lg font-normal text-muted-foreground">د.ع</span>
                    </h4>
                  )}
                </div>
              </div>

              {/* Wattage Display */}
              {(calculateTotalPower() > 0 || getPSUCapacity() > 0) && (
                <div className="p-4 bg-secondary rounded-md space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: '#06c6a1' }} />
                      <span className="text-muted-foreground">الواط التقديري</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      <span style={{ color: getPowerUsagePercentage() > 90 ? '#f97316' : getPowerUsagePercentage() > 70 ? '#f59e0b' : '#06c6a1' }}>
                        {calculateTotalPower()}W
                      </span>
                      {getPSUCapacity() > 0 && (
                        <span className="text-muted-foreground font-normal"> / {getPSUCapacity()}W</span>
                      )}
                    </div>
                  </div>
                  {getPSUCapacity() > 0 && (
                    <>
                      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, getPowerUsagePercentage())}%`,
                            backgroundColor: getPowerUsagePercentage() > 90 ? '#f97316' : getPowerUsagePercentage() > 70 ? '#f59e0b' : '#06c6a1',
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {getPowerUsagePercentage()}% من طاقة مزود الطاقة
                      </p>
                    </>
                  )}
                </div>
              )}

              {hasCustomizations && (
                <div className="flex items-center justify-between text-sm pb-2 border-b border-border">
                  <span className="text-muted-foreground">السعر الأصلي:</span>
                  <span className="line-through text-muted-foreground">{formatPrice(getOriginalPrice())} د.ع</span>
                </div>
              )}

              {hasCustomizations && getPriceDifference() !== 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الفرق:</span>
                  <span className={`font-bold ${getPriceDifference() > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {getPriceDifference() > 0 ? '+' : ''}{formatPrice(getPriceDifference())} د.ع
                  </span>
                </div>
              )}

              <button
                onClick={addToCart}
                disabled={addingToCart}
                className="w-full py-4 text-white font-bold text-xl rounded-md hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: '#06c6a1' }}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <>
                    <span>أضف إلى السلة</span>
                    <ShoppingCart className="h-6 w-6" />
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/build-pc')}
                className="w-full py-3 border border-border text-muted-foreground rounded-md transition-all text-sm hover:opacity-80"
                style={{ borderColor: 'rgba(6, 198, 161, 0.3)' }}
              >
                ابدأ تجميعة جديدة
              </button>
            </div>
          </section>

        </div>
      </div >
    </div >
  );
}
