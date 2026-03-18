'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Eye } from 'lucide-react';
import { api, type Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useQuickView } from '@/contexts/QuickViewContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { openQuickView } = useQuickView();

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProducts({ search: query, limit: 50 });
        setProducts(response.data);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">نتائج البحث</h1>
        {query && (
          <p className="text-muted-foreground mb-8">
            نتائج البحث عن: "{query}" ({products.length} منتج)
          </p>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-4">لا توجد منتجات!</h2>
            <p className="text-muted-foreground mb-8">
              {query
                ? `لم نجد منتجات مطابقة لـ "${query}"`
                : 'قم بإدخال كلمة للبحث عن المنتجات'
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              تصفح جميع المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => openQuickView(product)}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform"
                  />
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-[2.5rem]">{product.name}</h3>
                  <p className="text-base sm:text-lg text-primary font-bold whitespace-nowrap mt-auto">{formatPrice(product.price)} د.ع</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
