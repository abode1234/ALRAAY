'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type DisplayCategory } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActiveDisplayCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">جميع التصنيفات</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-8 bg-card rounded-xl border border-border animate-pulse text-center">
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link ? `${category.link}${category.link.includes('?') ? '&' : '?'}isolated=true` : `/products?category=${category.slug}&isolated=true`}
                className="group p-8 bg-card rounded-xl border border-border hover:border-primary transition-all hover:shadow-lg text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                    <img
                      src={category.icon}
                      alt={category.nameAr}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-6xl">{category.icon}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {category.nameAr || category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
