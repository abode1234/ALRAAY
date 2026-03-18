'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type DisplayCategory } from '@/lib/api';

export function CategoryStrip() {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.getDisplayCategories();
        setCategories(data.filter(c => c.isActive).sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="bg-secondary py-6 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-lg p-6 overflow-x-auto border border-border">
          <div className="flex gap-8 justify-start">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link || `/products?category=${category.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl group-hover:bg-primary/20 transition-colors border border-border group-hover:border-primary/50">
                  {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                    <img
                      src={category.icon}
                      alt={category.nameAr || category.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span>{category.icon}</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground text-center whitespace-nowrap group-hover:text-primary transition-colors font-medium">
                  {category.nameAr || category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
