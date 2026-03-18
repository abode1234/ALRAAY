import Image from 'next/image'

interface HeroBannerProps {
  title: string
  subtitle: string
  gradient: string
  imageQuery?: string
}

export function HeroBanner({ title, subtitle, gradient, imageQuery = 'gaming pc components' }: HeroBannerProps) {
  return (
    <div className={`relative h-[400px] rounded-2xl overflow-hidden ${gradient} shadow-lg`}>
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Text Content - Right Side */}
        <div className="flex items-center justify-center p-8 md:p-12 order-2 md:order-1">
          <div className="text-white text-right">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-xl md:text-2xl opacity-95">
              {subtitle}
            </p>
          </div>
        </div>
        
        {/* Image - Left Side */}
        <div className="relative flex items-center justify-center p-8 order-1 md:order-2">
          <div className="relative w-full h-full max-w-md">
            <Image
              src="/img/placeholder.jpg"
              alt={title}
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
