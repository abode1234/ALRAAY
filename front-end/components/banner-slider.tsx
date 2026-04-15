'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Banner } from '@/lib/api';

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export default function BannerSlider({ banners, autoPlayInterval = 3000 }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, autoPlayInterval, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد عروض حالياً</p>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  const BannerWrapper = currentBanner.link ? 'a' : 'div';
  const bannerProps = currentBanner.link
    ? { href: currentBanner.link, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden group">
      {/* Banner Image */}
      <BannerWrapper {...bannerProps} className="block h-full">
        <div key={currentIndex} className="relative h-full animate-fadeIn group">
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            quality={95}
            priority={currentIndex === 0}
            className="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* Banner Content */}
          <div className="absolute bottom-0 right-0 p-4 sm:p-6 md:p-8 text-white w-full">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 animate-slideUp">
              {currentBanner.title}
            </h3>
            {currentBanner.description && (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-2 animate-slideUp animation-delay-100">
                {currentBanner.description}
              </p>
            )}
          </div>
        </div>
      </BannerWrapper>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`الذهاب إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
