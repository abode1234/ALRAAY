'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import Link from 'next/link';
import { type Brand } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface Category {
  slug: string;
  name: string;
  nameAr: string;
}

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  productPrices: number[];
}

export function FilterSidebar({ categories, brands, productPrices }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  const currentSearch = searchParams.get('search');
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const isIsolated = searchParams.get('isolated') === 'true';

  // Slider state
  const minAvailablePrice = productPrices.length > 0 ? Math.min(...productPrices) : 0;
  const maxAvailablePrice = productPrices.length > 0 ? Math.max(...productPrices) : 1000000;

  const currentMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : minAvailablePrice;
  const currentMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : maxAvailablePrice;

  const [priceRange, setPriceRange] = useState([currentMinPrice, currentMaxPrice]);

  useEffect(() => {
    // Update local state if URL changes externally
    setPriceRange([
      searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : minAvailablePrice,
      searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : maxAvailablePrice
    ]);
  }, [searchParams, minAvailablePrice, maxAvailablePrice]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const applyPriceFilters = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('minPrice', priceRange[0].toString());
    p.set('maxPrice', priceRange[1].toString());
    p.set('page', '1');
    if (isIsolated) p.set('isolated', 'true');
    router.push(`/products?${p.toString()}`);
  };

  const clearFilters = () => {
    const p = new URLSearchParams();
    if (currentSearch) p.set('search', currentSearch);
    if (isIsolated && currentCategory) {
      p.set('category', currentCategory);
      p.set('isolated', 'true');
    }
    router.push(`/products${p.toString() ? '?' + p.toString() : ''}`);
  };

  const hasActiveFilters = currentCategory || currentBrand || searchParams.get('minPrice') || searchParams.get('maxPrice');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm ${hasActiveFilters
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-secondary border-border hover:border-primary'
            }`}
        >
          <Filter className="h-4 w-4" />
          <span>الفلاتر</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(currentCategory ? 1 : 0) + (currentBrand ? 1 : 0) + (searchParams.get('minPrice') || searchParams.get('maxPrice') ? 1 : 0)}
            </span>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-right text-xl font-bold">تصفية المنتجات</SheetTitle>
          <SheetDescription className="text-right">اختر الفلاتر المناسبة لتخصيص نتائج البحث</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          
          {/* Categories Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-right">التصنيفات</h3>
            <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {!isIsolated && (
                <Link
                  href={`/products${currentSearch ? `?search=${currentSearch}` : ''}${isNewArrival ? `${currentSearch ? '&' : '?'}isNewArrival=true` : ''}`}
                  className={`block w-full text-right px-4 py-2.5 rounded-lg transition-colors border ${!currentCategory
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-background hover:bg-secondary border-transparent'
                    }`}
                >
                  الكل
                </Link>
              )}
              {categories.filter(cat => !isIsolated || cat.slug.toLowerCase() === currentCategory?.toLowerCase()).map((cat) => {
                const catParams = new URLSearchParams();
                catParams.set('category', cat.slug);
                if (currentSearch) catParams.set('search', currentSearch);
                if (isNewArrival) catParams.set('isNewArrival', 'true');
                if (isIsolated) catParams.set('isolated', 'true');
                return (
                  <Link
                    key={cat.slug}
                    href={`/products?${catParams.toString()}`}
                    className={`block w-full text-right px-4 py-2.5 rounded-lg transition-colors border ${currentCategory?.toLowerCase() === cat.slug.toLowerCase()
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-background hover:bg-secondary border-transparent border-b-border/30 last:border-b-transparent'
                      }`}
                  >
                    {cat.nameAr}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Brands Section (Conditional) */}
          {currentCategory && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-right">الماركات</h3>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href={`/products?category=${currentCategory}${currentSearch ? `&search=${currentSearch}` : ''}${isNewArrival ? '&isNewArrival=true' : ''}${isIsolated ? '&isolated=true' : ''}`}
                  className={`p-2 text-center text-sm rounded-lg border transition-colors flex items-center justify-center ${!currentBrand
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-background border-border hover:border-primary'
                    }`}
                >
                  الكل
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?category=${currentCategory}&brand=${b.name}${isIsolated ? '&isolated=true' : ''}`}
                    className={`h-12 rounded-lg border overflow-hidden transition-colors flex items-center justify-center ${currentBrand === b.name
                        ? 'border-primary ring-1 ring-primary bg-primary/5'
                        : 'bg-background border-border hover:border-primary'
                      }`}
                    title={b.nameAr || b.name}
                  >
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.nameAr || b.name}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs p-1 line-clamp-2 text-center">{b.nameAr || b.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Section */}
          <div className="pb-8">
            <h3 className="text-lg font-semibold mb-5 text-right">السعر</h3>
            <div className="px-3">
              <Slider
                min={minAvailablePrice}
                max={maxAvailablePrice}
                step={1000}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mb-6"
                dir="ltr"
              />
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-4 w-full" dir="ltr">
                  <span>{formatPrice(priceRange[0])} د.ع</span>
                  <span>{formatPrice(priceRange[1])} د.ع</span>
              </div>
              <button
                onClick={applyPriceFilters}
                className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                تطبيق السعر
              </button>
            </div>
          </div>

          {/* Clear Filters (if active) */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 py-3 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors font-medium"
              >
                <X className="h-4 w-4" />
                مسح جميع الفلاتر
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
