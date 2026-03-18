'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { api, type Product as APIProduct } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useQuickView } from '@/contexts/QuickViewContext';

type DisplayCategory = {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon: string;
  link?: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  images: string[];
  category: string;
  stock: number;
  avgRating: number;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<DisplayCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryNotFound, setCategoryNotFound] = useState(false);
  const { openQuickView } = useQuickView();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Fetch all display categories and find the matching one
        const categories = await api.getDisplayCategories();
        const foundCategory = categories.find((cat: DisplayCategory) => cat.slug === slug);

        if (!foundCategory) {
          setCategoryNotFound(true);
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Fetch products for this category using the slug
        const response = await api.getProducts({ category: slug, limit: 50 });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug]);

  if (categoryNotFound) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">المنتجات</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{category.nameAr || category.name}</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{category.nameAr || category.name}</h1>
        <p className="text-muted-foreground mb-8">عدد المنتجات: {products.length}</p>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">لا توجد منتجات متاحة في هذه الفئة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => openQuickView(product as unknown as APIProduct)}
                className="bg-card border border-border rounded-md overflow-hidden hover:shadow-sm transition-all group cursor-pointer h-full flex flex-col"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
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
