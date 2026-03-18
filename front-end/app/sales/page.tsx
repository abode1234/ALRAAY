'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Filter, Tag, ShoppingCart, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { api, type Product, type Brand } from '@/lib/api';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { useQuickView } from '@/contexts/QuickViewContext';
import { FilterSidebar } from '@/components/FilterSidebar';

function SalesContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; nameAr: string }>>([]);
  const [productPrices, setProductPrices] = useState<number[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await api.getProducts({
          category: category || undefined,
          search: search || undefined,
          page,
          brand: brand || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          hasDiscount: true,
          limit: 48,
        });
        setProducts(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [category, search, page, brand, minPrice, maxPrice]);

  useEffect(() => {
    async function loadBrands() {
      try {
        if (category) {
          const brandsData = await api.getBrandsByCategory(category);
          setBrands(brandsData);
        } else {
          const brandsData = await api.getBrands();
          setBrands(brandsData);
        }
      } catch (error) {
        console.error('Failed to load brands:', error);
        try {
          const allBrands = await api.getBrands();
          setBrands(allBrands);
        } catch {
          setBrands([]);
        }
      }
    }
    loadBrands();
  }, [category]);

  useEffect(() => {
    async function loadFiltersData() {
      try {
        const [categoriesData, filtersData] = await Promise.all([
          api.getDisplayCategories(),
          api.getFilters(),
        ]);
        setCategories(categoriesData.map(cat => ({
          slug: cat.slug,
          name: cat.name,
          nameAr: cat.nameAr
        })));
        if (filtersData.prices) {
          setProductPrices(filtersData.prices);
        }
      } catch (error) {
        console.error('Failed to load filters data:', error);
      }
    }
    loadFiltersData();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="h-10 w-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              {category
                ? categories.find(c => c.slug.toLowerCase() === category.toLowerCase())?.nameAr || 'المنتجات'
                : 'التخفيضات والعروض'
              }
            </h1>
          </div>
          <p className="text-gray-400">
            احصل على أفضل العروض والتخفيضات على قطع الكمبيوتر والإكسسوارات
            {total > 0 && <span className="mr-2">({total} منتج)</span>}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-end">
          <FilterSidebar
            categories={categories}
            brands={brands}
            productPrices={productPrices}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-4 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 text-lg">لا توجد منتجات مخفضة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/sales?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }).toString()}`}
                  className="px-4 py-2 bg-secondary border border-border text-white rounded-lg hover:border-primary transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>السابق</span>
                </Link>
              )}

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 2 && pageNum <= page + 2)) {
                  return (
                    <Link
                      key={pageNum}
                      href={`/sales?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(pageNum) }).toString()}`}
                      className={`px-4 py-2 rounded-lg transition-colors ${page === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-secondary border border-border hover:border-primary'
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                } else if (pageNum === page - 3 || pageNum === page + 3) {
                  return <span key={pageNum} className="px-2 py-2">...</span>;
                }
                return null;
              })}

              {page < totalPages && (
                <Link
                  href={`/sales?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }).toString()}`}
                  className="px-4 py-2 bg-secondary border border-border text-white rounded-lg hover:border-primary transition-colors flex items-center gap-2"
                >
                  <span>التالي</span>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useQuickView();

  return (
    <div className="group h-full">
      <div className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover-scale h-full flex flex-col">
        <div
          className="relative aspect-square bg-card cursor-pointer"
          onClick={() => openQuickView(product)}
        >
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold">غير متوفر</span>
            </div>
          )}
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10 shadow-lg">
              {Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}% خصم
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 h-[3rem] cursor-pointer"
            onClick={() => openQuickView(product)}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-2xl font-bold text-primary whitespace-nowrap">
                {formatPrice(product.price)} د.ع
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-xs text-muted-foreground line-through whitespace-nowrap">
                  {formatPrice(Number(product.compareAtPrice))} د.ع
                </span>
              )}
            </div>
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await api.addToCart(product.id, 1);
                  toast.success('تمت الإضافة إلى السلة');
                  window.dispatchEvent(new Event('cart-updated'));
                } catch (error) {
                  toast.error('حدث خطأ أثناء الإضافة إلى السلة');
                }
              }}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">جاري التحميل...</div>
      </div>
    }>
      <SalesContent />
    </Suspense>
  )
}
