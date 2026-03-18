'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, ArrowLeft } from 'lucide-react';
import { api, type Product, type Banner, type Section, type DisplayCategory } from '@/lib/api';
import BannerSlider from '@/components/banner-slider';
import CategorySlider from '@/components/category-slider';
import { formatPrice } from '@/lib/utils';
import { useQuickView } from '@/contexts/QuickViewContext';
import { toast } from 'sonner';
import Link from 'next/link';

export default function HomePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  useEffect(() => {
    async function loadData() {
      try {
        const sectionsData = await api.getSections();
        // Sort by order
        setSections(sectionsData.filter(s => s.isActive).sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Failed to load sections:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadBanners() {
      try {
        const response = await api.getActiveBanners();
        setBanners(response);
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setBannersLoading(false);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.getActiveDisplayCategories();
        setCategories(response);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Promotional Banners */}
      <section className="py-6 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:h-[450px]">
            {/* Large Banner Slider - Right Side */}
            <div className="lg:col-span-2 lg:order-2 h-[250px] sm:h-[350px] lg:h-full">
              {bannersLoading ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-800 animate-pulse">
                  <div className="bg-gray-700 h-full"></div>
                </div>
              ) : (
                <BannerSlider banners={banners.filter(b => b.position === 'MAIN_SLIDER' || !b.position)} />
              )}
            </div>

            {/* Two Small Banners - Left Side Stacked */}
            <div className="lg:col-span-1 lg:order-1 flex flex-col gap-4 md:gap-6 h-[300px] sm:h-[350px] lg:h-full">
              {/* Top Small Banner Slider */}
              {banners.filter(b => b.position === 'SECONDARY_TOP').length > 0 && (
                <div className="flex-1">
                  <BannerSlider
                    banners={banners.filter(b => b.position === 'SECONDARY_TOP')}
                    autoPlayInterval={4000}
                  />
                </div>
              )}

              {/* Bottom Small Banner Slider */}
              {banners.filter(b => b.position === 'SECONDARY_BOTTOM').length > 0 && (
                <div className="flex-1">
                  <BannerSlider
                    banners={banners.filter(b => b.position === 'SECONDARY_BOTTOM')}
                    autoPlayInterval={5000}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip - Hidden on mobile (categories are in hamburger menu) */}
      <section className="hidden md:block py-12 bg-secondary-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">التصنيفات</h2>
          {categoriesLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[120px] md:w-[140px] p-4 md:p-6 bg-background rounded-lg border border-border animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-10 w-10 mx-auto rounded-full mb-3"></div>
                  <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <CategorySlider categories={categories} />
          )}
        </div>
      </section>

      {/* Dynamic Sections */}
      {sections.map((section) => (
        <SectionSlider key={section.id} section={section} />
      ))}

      {loading && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background border border-border rounded-lg p-4 animate-pulse">
                  <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-background rounded-lg border border-border">
              <img src="/icons/shield.svg" alt="ضمان شامل" className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">ضمان شامل</h3>
              <p className="text-gray-400">على جميع المنتجات</p>
            </div>
            <div className="text-center p-8 bg-background rounded-lg border border-border">
              <img src="/icons/delivery.svg" alt="توصيل سريع" className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">توصيل سريع</h3>
              <p className="text-gray-400">لجميع المحافظات</p>
            </div>
            <div className="text-center p-8 bg-background rounded-lg border border-border">
              <img src="/icons/headset.svg" alt="تواصل معنا" className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">تواصل معنا</h3>
              <p className="text-gray-400 mb-4">على مدار الساعة</p>
              <div className="flex flex-col items-center gap-3">
                <a
                  href="https://api.whatsapp.com/send?phone=9647736742199&text=مرحباً، أحتاج مساعدة فنية"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full max-w-[200px] px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>الدعم الفني</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=9647723440578&text=مرحباً، لدي استفسار عن الطلب"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full max-w-[200px] px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>خدمة الزبائن</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function SectionSlider({ section }: { section: Section }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isScrollingRef = useRef(false);

  const checkScrollability = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(Math.abs(scrollLeft) < scrollWidth - clientWidth - 1);
    setCanScrollRight(Math.abs(scrollLeft) > 1);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [section.items]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container || isScrollingRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const atEnd = Math.abs(scrollLeft) >= scrollWidth - clientWidth - 1;
      isScrollingRef.current = true;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -300, behavior: 'smooth' });
      }
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const products = useMemo(
    () => shuffleArray(
      section.items?.filter((item: any) => item.product).map((item: any) => item.product) || []
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section.id]
  );

  return (
    <section className={`py-16 ${section.order % 2 !== 0 ? 'bg-secondary-light' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{section.title}</h2>
          <Link
            href={section.slug}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-semibold text-sm"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا تتوفر منتجات في هذا القسم حالياً
          </div>
        ) : (
          <div className="relative">
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              ref={containerRef}
              onScroll={checkScrollability}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product: Product) => (
                <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useQuickView();

  return (
    <div className="group h-full">
      <div className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary transition-all h-full flex flex-col">
        <div
          className="relative aspect-square bg-card cursor-pointer"
          onClick={() => openQuickView(product)}
        >
          {product?.images?.[0] && (
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
          {/* Discount Badge */}
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10 shadow-lg">
              {Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}% خصم
            </div>
          )}
          {/* Quick View Overlay */}
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
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
