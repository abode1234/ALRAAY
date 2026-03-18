'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Product, type Brand, type DisplayCategory } from '@/lib/api';
import {
  Search,
  ShoppingCart,
  Trash2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { useQuickView } from '@/contexts/QuickViewContext';

const CATEGORIES = [
  { key: 'PSU', name: 'مزود الطاقة', nameVariants: ['مزود الطاقة', 'مزودات الطاقة', 'باور سبلاي', 'psu', 'power supply'], imagePath: '/pc-builder-icons/PSU.png', required: true, multiple: false },
  { key: 'CPU', name: 'المعالج', nameVariants: ['المعالج', 'المعالجات', 'بروسيسر', 'cpu', 'processor'], imagePath: '/pc-builder-icons/CPU.png', required: true, multiple: false },
  { key: 'GPU', name: 'كرت الشاشة', nameVariants: ['كرت الشاشة', 'كروت الشاشة', 'كروت شاشة', 'كارت الشاشة', 'gpu', 'graphics card', 'vga'], imagePath: '/pc-builder-icons/GPU.png', required: true, multiple: false },
  { key: 'MOTHERBOARD', name: 'اللوحة الأم', nameVariants: ['اللوحة الأم', 'اللوحات الأم', 'المذربورد', 'المذربوردات', 'motherboard'], imagePath: '/pc-builder-icons/MOTHERBOARD.png', required: true, multiple: false },
  { key: 'RAM', name: 'الذاكرة العشوائية', nameVariants: ['الذاكرة العشوائية', 'الرامات', 'رام', 'ram', 'memory'], imagePath: '/pc-builder-icons/RAM.png', required: true, multiple: true },
  { key: 'STORAGE', name: 'التخزين', nameVariants: ['التخزين', 'هارد', 'اس اس دي', 'storage', 'ssd', 'hdd'], imagePath: '/pc-builder-icons/STORAGE.png', required: true, multiple: true },
  { key: 'CASE', name: 'الكيس', nameVariants: ['الكيس', 'كيس', 'كيسات', 'case'], imagePath: '/pc-builder-icons/CASE.png', required: true, multiple: false },
  { key: 'COOLING', name: 'التبريد', nameVariants: ['التبريد', 'مبرد', 'تبريد', 'مراوح', 'cooling', 'cooler'], imagePath: '/pc-builder-icons/COOLER.png', required: true, multiple: false },
];

// Categories that allow multiple components
const MULTI_CATEGORIES = ['RAM', 'STORAGE'];

interface SelectedComponents {
  [category: string]: Product | Product[] | null;
}

import AuthModal from '@/components/AuthModal';

// ... existing imports

export default function BuildPCPage() {
  const router = useRouter();
  const { openQuickView } = useQuickView();
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [selectingCategory, setSelectingCategory] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoryBrands, setCategoryBrands] = useState<Brand[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [categorySlugMap, setCategorySlugMap] = useState<Record<string, string>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [globalBuildDiscount, setGlobalBuildDiscount] = useState<number>(0);

  useEffect(() => {
    api.getSettings().then(s => {
      setGlobalBuildDiscount(s.buildDiscount ? Number(s.buildDiscount) : 0);
    }).catch(() => {});
  }, []);

  // Fetch display categories and build slug mapping
  useEffect(() => {
    const buildSlugMap = async () => {
      try {
        const displayCategories = await api.getDisplayCategories();
        const slugMap: Record<string, string> = {};

        for (const cat of CATEGORIES) {
          // Try to find matching display category by name variants
          const match = displayCategories.find((dc: DisplayCategory) => {
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
            // Fallback: use the key itself (for backward compatibility)
            slugMap[cat.key] = cat.key;
          }
        }

        setCategorySlugMap(slugMap);
      } catch (error) {
        console.error('Failed to fetch display categories:', error);
        // Fallback: use keys as slugs
        const fallback: Record<string, string> = {};
        CATEGORIES.forEach(cat => { fallback[cat.key] = cat.key; });
        setCategorySlugMap(fallback);
      }
    };

    buildSlugMap();
  }, []);

  // Load selected components from localStorage on mount
  useEffect(() => {
    const savedComponents = localStorage.getItem('buildPcComponents');
    if (savedComponents) {
      try {
        const parsed = JSON.parse(savedComponents);
        setSelectedComponents(parsed);
      } catch (error) {
        console.error('Failed to load saved components:', error);
      }
    }
  }, []);

  // Save selected components to localStorage whenever they change
  useEffect(() => {
    const hasComponents = Object.values(selectedComponents).some(Boolean);
    if (hasComponents) {
      localStorage.setItem('buildPcComponents', JSON.stringify(selectedComponents));
    } else {
      localStorage.removeItem('buildPcComponents');
    }
  }, [selectedComponents]);

  const startSelecting = async (category: string) => {
    setSelectingCategory(category);
    setProductsLoading(true);
    setSelectedBrand('');
    setSearchQuery('');

    // Use the mapped slug from display categories, fallback to the key itself
    const categorySlug = categorySlugMap[category] || category;

    try {
      const response = await api.getProducts({ category: categorySlug, limit: 1000 });
      setAvailableProducts(response.data);
      // Fetch brands for this category
      try {
        const brandsData = await api.getBrandsByCategory(categorySlug);
        setCategoryBrands(brandsData);
      } catch {
        // Fallback to all brands if category endpoint fails
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
    if (!selectingCategory) return;
    const catKey = selectingCategory;
    const isMultiple = MULTI_CATEGORIES.includes(catKey);

    const existing = selectedComponents[catKey];
    const existingArray = Array.isArray(existing) ? existing : existing ? [existing] : [];
    const newCount = existingArray.length + 1;

    if (isMultiple) {
      // Check stock limit
      const currentCount = existingArray.filter(p => p.id === product.id).length;
      if (currentCount >= product.stock) {
        toast.error(`الكمية المتوفرة من "${product.name}" هي ${product.stock} فقط`);
        return;
      }
    }

    setSelectedComponents(prev => {
      if (isMultiple) {
        return {
          ...prev,
          [catKey]: [...existingArray, product]
        };
      } else {
        return {
          ...prev,
          [catKey]: product
        };
      }
    });

    toast.success(`تمت إضافة "${product.name}"`, { duration: 2000 });

    let shouldAdvance = false;
    if (!isMultiple) {
      shouldAdvance = true;
    } else if (catKey === 'RAM' && newCount >= 2) {
      shouldAdvance = true;
    } else if (catKey === 'STORAGE' && newCount >= 3) {
      shouldAdvance = true;
    }

    if (shouldAdvance) {
      // Build a mock of the next state to check which categories are filled
      const nextStateMock = { ...selectedComponents };
      if (isMultiple) {
        nextStateMock[catKey] = [...existingArray, product];
      } else {
        nextStateMock[catKey] = product;
      }
      
      const currentIndex = CATEGORIES.findIndex(c => c.key === catKey);
      let nextCategory = null;
      
      for (let i = currentIndex + 1; i < CATEGORIES.length; i++) {
        const cat = CATEGORIES[i];
        const items = nextStateMock[cat.key];
        const count = Array.isArray(items) ? items.length : (items ? 1 : 0);
        
        let isFilled = false;
        if (!cat.multiple) isFilled = count >= 1;
        else if (cat.key === 'RAM') isFilled = count >= 2;
        else if (cat.key === 'STORAGE') isFilled = count >= 3;
        
        if (!isFilled) {
          nextCategory = cat.key;
          break;
        }
      }

      if (nextCategory) {
        // Smooth transition to next category
        setTimeout(() => {
          startSelecting(nextCategory!);
        }, 150);
      } else {
        setSelectingCategory(null);
        setAvailableProducts([]);
      }
    }
  };

  const removeComponent = (category: string, productId?: string, index?: number) => {
    setSelectedComponents(prev => {
      const existing = prev[category];
      if (MULTI_CATEGORIES.includes(category) && Array.isArray(existing) && productId) {
        // Remove by index to handle duplicates correctly
        if (index !== undefined) {
          const filtered = existing.filter((_, i) => i !== index);
          return {
            ...prev,
            [category]: filtered.length > 0 ? filtered : null
          };
        }
        // Fallback: remove first occurrence of this product
        let removed = false;
        const filtered = existing.filter(p => {
          if (!removed && p.id === productId) {
            removed = true;
            return false;
          }
          return true;
        });
        return {
          ...prev,
          [category]: filtered.length > 0 ? filtered : null
        };
      }
      return {
        ...prev,
        [category]: null
      };
    });
  };

  const getBrands = () => {
    // Use brands from API if available, otherwise extract from products
    if (categoryBrands.length > 0) {
      return categoryBrands.map(b => b.name).sort();
    }
    const brands = new Set(availableProducts.map(p => p.brand));
    return Array.from(brands).sort();
  };

  // Compatibility detection helpers — use admin-defined fields first, keyword fallback
  const getPlatform = (product: Product): string | null => {
    if ((product as any).platform) return (product as any).platform.toLowerCase();
    const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
    if (['intel', ' i3', ' i5', ' i7', ' i9', 'lga 1700', 'lga 1200', 'core i'].some(p => text.includes(p))) return 'intel';
    if (['amd', 'ryzen', 'am4', 'am5', 'threadripper'].some(p => text.includes(p))) return 'amd';
    return null;
  };

  // Returns array of socket types (handles comma-separated values)
  const getSocketTypes = (product: Product): string[] => {
    const raw = (product as any).socketType;
    if (!raw) return [];
    return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
  };

  // Returns array of memory types (handles comma-separated values)
  const getMemoryTypes = (product: Product): string[] => {
    const raw = (product as any).memoryType;
    if (raw) return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    const text = `${product.name} ${JSON.stringify(product.specifications || {})}`.toLowerCase();
    if (text.includes('ddr5') && !text.includes('ddr4')) return ['ddr5'];
    if (text.includes('ddr4') && !text.includes('ddr5')) return ['ddr4'];
    return [];
  };

  // Check if two arrays have any common element
  const hasOverlap = (a: string[], b: string[]): boolean => {
    return a.some(val => b.includes(val));
  };

  const getFilteredProducts = () => {
    return availableProducts.filter(p => {
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesBrand || !matchesSearch) return false;

      // Compatibility filtering — strict: if selected component has data, candidate must also match
      if (selectingCategory === 'MOTHERBOARD') {
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
      }

      if (selectingCategory === 'CPU') {
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

      if (selectingCategory === 'RAM') {
        const mb = selectedComponents['MOTHERBOARD'];
        if (mb && !Array.isArray(mb)) {
          const mbMemTypes = getMemoryTypes(mb);
          if (mbMemTypes.length > 0) {
            const ramMemTypes = getMemoryTypes(p);
            if (!hasOverlap(mbMemTypes, ramMemTypes)) return false;
          }
        } else {
          // No motherboard selected — fall back to CPU's memory type
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
  };

  // Helper to get all products as flat array
  const getAllProducts = (): Product[] => {
    return Object.values(selectedComponents)
      .filter(Boolean)
      .flatMap(item => Array.isArray(item) ? item : [item as Product]);
  };

  const calculateTotalPrice = () => {
    return getAllProducts().reduce((sum, product) => sum + Number(product?.price || 0), 0);
  };

  // Calculate power consumption excluding PSU (PSU provides power, doesn't consume it)
  const calculateTotalPower = () => {
    return Object.entries(selectedComponents)
      .filter(([category, item]) => item !== null && category !== 'PSU')
      .flatMap(([_, item]) => Array.isArray(item) ? item : [item as Product])
      .reduce((sum, product) => sum + Number(product?.powerConsumption || 0), 0);
  };

  // Get PSU capacity (wattage)
  const getPSUCapacity = () => {
    const psu = selectedComponents['PSU'];
    if (!psu || Array.isArray(psu)) return 0;
    // PSU wattage is stored in powerConsumption field (it represents capacity, not consumption)
    return Number(psu.powerConsumption || 0);
  };

  // Calculate power usage percentage
  const getPowerUsagePercentage = () => {
    const psuCapacity = getPSUCapacity();
    if (psuCapacity === 0) return 0;
    return Math.min(100, Math.round((calculateTotalPower() / psuCapacity) * 100));
  };

  // Get power status color
  const getPowerStatusColor = () => {
    const percentage = getPowerUsagePercentage();
    if (percentage <= 60) return 'bg-emerald-500';
    if (percentage <= 80) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const hasRequiredComponents = () => {
    return CATEGORIES
      .filter(cat => cat.required)
      .every(cat => {
        const component = selectedComponents[cat.key];
        if (Array.isArray(component)) {
          return component.length > 0;
        }
        return !!component;
      });
  };

  // Helper to check if a category has any selected items
  const hasSelectedItems = (category: string) => {
    const items = selectedComponents[category];
    if (Array.isArray(items)) return items.length > 0;
    return !!items;
  };

  // Get items for a category as array
  const getCategoryItems = (category: string): Product[] => {
    const items = selectedComponents[category];
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  };

  const addToCart = async () => {
    if (!hasRequiredComponents()) {
      toast.error('يجب اختيار جميع القطع المطلوبة');
      return;
    }

    if (!api.isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }

    setAddingToCart(true);
    try {
      await api.addBuildToCart(selectedComponents, globalBuildDiscount > 0 ? globalBuildDiscount : undefined);

      toast.success('تمت إضافة التجميعة إلى السلة!');

      // Clear selected components after adding to cart
      setSelectedComponents({});
      localStorage.removeItem('buildPcComponents');

      // Optionally redirect to cart
      router.push('/cart');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error('يجب تسجيل الدخول لإضافة المنتجات للسلة');
        router.push('/account');
      } else {
        toast.error(error.message || 'فشل إضافة القطع للسلة');
      }
    } finally {
      setAddingToCart(false);
    }
  };



  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">بناء الكمبيوتر</h1>
          <p className="text-gray-400">
            اختر قطع جهازك بنفسك واحصل على التجميعة المثالية لاحتياجاتك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Components Selection */}
          <div className="lg:col-span-2 space-y-4">
            {CATEGORIES.map((category) => {
              const imagePath = category.imagePath;
              const categoryItems = getCategoryItems(category.key);
              const isSelecting = selectingCategory === category.key;
              const isMultiple = category.multiple;

              return (
                <div key={category.key} className="bg-background border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Render Image Icon */}
                      <img
                        src={imagePath}
                        alt={category.name}
                        className="h-8 w-8 object-contain icon-brand-green"
                      />
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      {category.required && (
                        <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">
                          مطلوب
                        </span>
                      )}
                      {isMultiple && (
                        <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">
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
                            className="w-full pr-10 pl-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <select
                          value={selectedBrand}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">جميع البراندات</option>
                          {getBrands().map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      {/* Products List */}
                      {productsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {getFilteredProducts().map(product => (
                            <div
                              key={product.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${(Array.isArray(selectedComponents[selectingCategory!])
                                ? (selectedComponents[selectingCategory!] as Product[]).some(p => p.id === product.id)
                                : (selectedComponents[selectingCategory!] as Product)?.id === product.id
                              )
                                ? 'bg-primary/10 border-2 border-primary'
                                : 'bg-secondary hover:bg-accent border border-transparent'
                                }`}
                            >
                              {/* Product Image */}
                              {product.images && product.images[0] && (
                                <div
                                  className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                  onClick={() => openQuickView(product)}
                                >
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                              )}
                              <button
                                onClick={() => selectComponent(product)}
                                className="flex-1 text-right"
                              >
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-400">{product.brand}</p>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openQuickView(product);
                                }}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="عرض التفاصيل"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <span className="text-primary font-bold whitespace-nowrap">
                                {formatPrice(product.price)} د.ع
                              </span>
                            </div>
                          ))}
                          {getFilteredProducts().length === 0 && (
                            <p className="text-center text-gray-400 py-4">لا توجد قطع متاحة</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setSelectingCategory(null)}
                        className={`w-full px-4 py-2 rounded-lg transition-colors ${isMultiple && hasSelectedItems(category.key)
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-secondary hover:bg-accent'
                          }`}
                      >
                        {isMultiple && hasSelectedItems(category.key) ? 'تم' : 'إلغاء'}
                      </button>
                    </div>
                  ) : categoryItems.length > 0 ? (
                    <div className="space-y-3">
                      {categoryItems.map((product, index) => (
                        <div key={`${product.id}-${index}`} className="flex items-center gap-4 p-2 bg-secondary/30 rounded-lg">
                          {/* Product Image */}
                          {product.images && product.images[0] && (
                            <div
                              className="w-14 h-14 bg-secondary rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => openQuickView(product)}
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold mb-1 truncate cursor-pointer hover:text-primary transition-colors text-sm"
                              onClick={() => openQuickView(product)}
                            >
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openQuickView(product)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <span className="text-primary font-bold text-sm whitespace-nowrap">
                              {formatPrice(product.price)} د.ع
                            </span>
                            <button
                              onClick={() => removeComponent(category.key, product.id, index)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="إزالة"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Add more button for multi-select categories */}
                      {isMultiple && (
                        <button
                          onClick={() => startSelecting(category.key)}
                          className="w-full py-2 border-2 border-dashed border-border hover:border-primary rounded-lg transition-colors text-gray-400 hover:text-primary text-sm"
                        >
                          + إضافة {category.name} آخر
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => startSelecting(category.key)}
                      className="w-full py-3 border-2 border-dashed border-border hover:border-primary rounded-lg transition-colors text-gray-400 hover:text-primary"
                    >
                      + اختر {category.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">ملخص التجميعة</h3>

                {!hasRequiredComponents() && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500">
                      يجب اختيار جميع القطع المطلوبة
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">عدد القطع:</span>
                    <span className="font-semibold">
                      {getAllProducts().length} قطع
                    </span>
                  </div>

                  {/* Power Usage Bar */}
                  {(calculateTotalPower() > 0 || getPSUCapacity() > 0) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">استهلاك الطاقة:</span>
                        <span className="font-semibold">
                          {calculateTotalPower()}W / {getPSUCapacity() > 0 ? `${getPSUCapacity()}W` : 'لم يتم اختيار PSU'}
                        </span>
                      </div>
                      {getPSUCapacity() > 0 && (
                        <div className="relative">
                          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPowerStatusColor()}`}
                              style={{ width: `${getPowerUsagePercentage()}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className={`${getPowerUsagePercentage() > 80 ? 'text-orange-500' : 'text-gray-400'}`}>
                              {getPowerUsagePercentage()}% مستخدم
                            </span>
                            {getPowerUsagePercentage() > 80 && (
                              <span className="text-orange-500">⚠️ تحذير</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-3 space-y-1">
                    {globalBuildDiscount > 0 && hasRequiredComponents() ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">السعر الأصلي:</span>
                          <span className="text-base line-through text-gray-400">
                            {formatPrice(calculateTotalPrice())} د.ع
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">الإجمالي:</span>
                          <span className="text-2xl font-bold text-green-500">
                            {formatPrice(Math.max(0, calculateTotalPrice() - globalBuildDiscount))} د.ع
                          </span>
                        </div>
                        <p className="text-xs text-green-500 text-left">
                          وفّرت {formatPrice(globalBuildDiscount)} د.ع
                        </p>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">الإجمالي:</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(calculateTotalPrice())} د.ع
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  disabled={!hasRequiredComponents() || addingToCart}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      <span>جاري الإضافة...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>إضافة للسلة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Promotional Image below the summary */}
              <div className="hidden lg:block rounded-xl overflow-hidden border border-border relative group shadow-lg">
                <img 
                  src="/gaming-pc-setup-rgb.jpg" 
                  alt="Gaming PC Setup" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h4 className="text-white font-bold text-xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">تجميعتك المثالية</h4>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">أداء عالي يعكس قوة اختيارك</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}
