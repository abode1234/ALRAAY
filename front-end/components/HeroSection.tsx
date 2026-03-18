import Image from 'next/image'
import Link from 'next/link'

interface HeroBanner {
  id: string
  image: string
  title?: string
  description?: string
  link: string
  alt: string
}

interface HeroSectionProps {
  banners?: HeroBanner[]
}

const defaultBanners: HeroBanner[] = [
  {
    id: '1',
    image: '/gaming-pc-setup-rgb.jpg',
    title: 'تجميعاتنا نختار قطعها بعناية وتركيب احترافي مضمون',
    link: '/products?c=2086&p=1&s=1',
    alt: 'تجميعات احترافية',
  },
  {
    id: '2',
    image: '/nvidia-rtx-4090.jpg',
    title: 'تدور كرت شاشة؟',
    description: 'بس وصلت - متجرك الأول لكروت الشاشة في العراق',
    link: '/products?c=2073&p=1&s=2',
    alt: 'كروت الشاشة',
  },
  {
    id: '3',
    image: '/rtx-4090-graphics-card.jpg',
    link: '/products',
    alt: 'عروض خاصة',
  },
]

export function HeroSection({ banners = defaultBanners }: HeroSectionProps) {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="relative group block rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-[300px] md:h-[400px]"
            >
              <div className="relative w-full h-full bg-card">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-right">
                    {banner.title && (
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-gray-200 text-sm md:text-base">
                        {banner.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

