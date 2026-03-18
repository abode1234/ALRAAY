import Image from 'next/image'

interface BannerProps {
  image: string
  label?: string
  title: string
  subtitle?: string
  className?: string
  highlightTitle?: boolean
}

function Banner({ image, label, title, subtitle, className = '', highlightTitle = false }: BannerProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-shadow duration-300 ${className}`}>
      {/* Background Image */}
      <div className="relative w-full h-full bg-card">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        {/* Dark Overlay with Orange Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-l from-teal-600/10 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6 md:p-8 lg:p-10 text-right">
          {/* Top Label/Brand */}
          {label && (
            <div className="mb-auto flex items-start justify-end">
              <span className="inline-block text-xs md:text-sm font-bold text-teal-400 bg-teal-600/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg backdrop-blur-sm border border-teal-600/30">
                {label}
              </span>
            </div>
          )}
          
          {/* Bottom Text Content */}
          <div className="mt-auto">
            <h2 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-3 leading-tight ${
              highlightTitle 
                ? 'text-white' 
                : 'bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent'
            }`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm md:text-base lg:text-lg text-gray-200 opacity-95 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroShowcase() {
  return (
    <section className="w-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Side: Two Stacked Banners */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
            {/* Top Small Banner - Professional Builds */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-shadow duration-300 h-[250px] md:h-[300px]">
              <div className="relative w-full h-full">
                <Image
                  src="/gaming-pc-setup-rgb.jpg"
                  alt="التجميعات الاحترافية"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-l from-orange-500/10 via-transparent to-transparent" />
                
                <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-right">
                  {/* Top - Brand */}
                  <div className="mb-auto flex items-start justify-end">
                    <span className="text-xs md:text-sm font-bold text-teal-600">
                      TTX TECHTRONIX
                    </span>
                  </div>
                  
                  {/* Bottom - Text with Arrow */}
                  <div className="mt-auto flex items-center justify-end gap-2">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      التجميعات الاحترافية
                    </h2>
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Small Banner - Graphics Cards */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-shadow duration-300 h-[250px] md:h-[300px]">
              <div className="relative w-full h-full">
                <Image
                  src="/rtx-4090-graphics-card.jpg"
                  alt="أي كرت شاشة"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-l from-orange-500/10 via-transparent to-transparent" />
                
                <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-right">
                  {/* Top - Brand */}
                  <div className="mb-auto flex items-start justify-end">
                    <span className="text-xs md:text-sm font-bold text-teal-600">
                      TTX TECHTRONIX
                    </span>
                  </div>
                  
                  {/* Bottom - Text with Arrow */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                        أي كرت شاشة
                      </h2>
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <p className="text-sm md:text-base text-gray-200 opacity-95">
                      تدور عليه راح تلقاه عندنا وبأفضل سعر
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Main Large Banner - Installments */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-shadow duration-300 h-[400px] md:h-[600px] lg:h-[650px]">
              <div className="relative w-full h-full bg-card">
                <Image
                  src="/gaming-pc-setup-rgb.jpg"
                  alt="تجميعات احترافية"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-l from-orange-500/10 via-transparent to-transparent" />
                
                <div className="relative h-full flex flex-col justify-between p-6 md:p-8 lg:p-10 text-right">
                  {/* Top - Payment Tags */}
                  <div className="mb-auto flex items-start justify-end gap-3 pt-4">
                    <div className="bg-teal-500 text-white px-4 py-2 rounded-lg font-bold text-sm md:text-base shadow-lg">
                      tabby
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm md:text-base shadow-lg">
                      تمارا
                    </div>
                  </div>
                  
                  {/* Bottom - Text Content */}
                  <div className="mt-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-tight text-white">
                      تدور تجميعات احترافية اقساط ؟
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-gray-200 opacity-95 font-medium mb-4 md:mb-6">
                      متوفرة في امازون باقساط تابي وتمارا
                    </p>
                    
                    {/* Logos */}
                    <div className="flex items-center gap-4">
                      <div className="text-white font-bold text-sm md:text-base opacity-80">
                        Amazon
                      </div>
                      <div className="text-teal-600 font-bold text-lg md:text-xl">
                        TTX TECHTRONIX
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

