'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tags } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string;
  slug: string;
  categories?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${API_URL}/brands`);
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">جميع الماركات</h1>
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">جميع الماركات</h1>

        {brands.length === 0 ? (
          <div className="text-center py-12">
            <Tags className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">لا توجد ماركات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.name}`}
                className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all group"
              >
                <div className="w-full aspect-[3/2] bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Tags className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <span className="font-semibold text-center">{brand.name}</span>
                {brand.nameAr && (
                  <span className="text-sm text-gray-500 text-center">{brand.nameAr}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
