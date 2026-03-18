'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DisplayCategory } from '@/lib/api';

interface CategorySliderProps {
  categories: DisplayCategory[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isScrollingRef = useRef(false);

  const checkScrollability = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // RTL: scrollLeft is 0 at start (right side) and negative when scrolled left
    // canScrollLeft means we can scroll towards the left (show more items on the left)
    // canScrollRight means we can scroll towards the right (go back)
    setCanScrollLeft(Math.abs(scrollLeft) < scrollWidth - clientWidth - 1);
    setCanScrollRight(Math.abs(scrollLeft) > 1);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [categories]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container || isScrollingRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // In RTL, scrollLeft is 0 or negative.
      const atEnd = Math.abs(scrollLeft) >= scrollWidth - clientWidth - 1;
      
      isScrollingRef.current = true;
      if (atEnd) {
        // Go back to start
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll right in RTL means scrolling negative
        container.scrollBy({ left: -200, behavior: 'smooth' });
      }
      
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    // RTL: negative scrollBy goes left, positive goes right
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Right Arrow (scroll back / right in RTL) */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          aria-label="التمرير لليمين"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Left Arrow (scroll forward / left in RTL) */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          aria-label="التمرير لليسار"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={containerRef}
        onScroll={checkScrollability}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.link || `/products?category=${category.slug}`}
            className="group flex-shrink-0 w-[130px] md:w-[160px] bg-background rounded-xl border border-border hover:border-primary transition-all hover:shadow-lg text-center overflow-hidden"
          >
            <div className="w-full aspect-square bg-white/5 flex items-center justify-center p-3">
              {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                <img
                  src={category.icon}
                  alt={category.nameAr}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-4xl md:text-5xl">{category.icon}</span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                {category.nameAr}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
