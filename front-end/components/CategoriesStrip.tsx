import Link from 'next/link'
import Image from 'next/image'

export interface Category {
  id: string
  name: string
  image: string
  slug: string
  categoryId: string
}

interface CategoriesStripProps {
  categories?: Category[]
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'اكسسوارات',
    image: '/logitech-logo.jpg',
    slug: 'accessories',
    categoryId: '2088',
  },
  {
    id: '2',
    name: 'تجميعات الألعاب',
    image: '/gaming-pc-setup-rgb.jpg',
    slug: 'gaming-builds',
    categoryId: '2086',
  },
  {
    id: '3',
    name: 'المعالجات',
    image: '/amd-ryzen-processor.jpg',
    slug: 'processors',
    categoryId: '2072',
  },
  {
    id: '4',
    name: 'كروت الشاشة',
    image: '/nvidia-rtx-4090.jpg',
    slug: 'graphics-cards',
    categoryId: '2073',
  },
  {
    id: '5',
    name: 'المذربوردات',
    image: '/asus-rog-motherboard.jpg',
    slug: 'motherboards',
    categoryId: '2074',
  },
  {
    id: '6',
    name: 'الرامات',
    image: '/corsair-rgb-ram.jpg',
    slug: 'ram',
    categoryId: '2075',
  },
  {
    id: '7',
    name: 'التخزين',
    image: '/samsung-ssd-nvme.jpg',
    slug: 'storage',
    categoryId: '2076',
  },
  {
    id: '8',
    name: 'المبردات',
    image: '/nzxt-logo.jpg',
    slug: 'cooling',
    categoryId: '2077',
  },
  {
    id: '9',
    name: 'مزودات الطاقة',
    image: '/corsair-power-supply.jpg',
    slug: 'power-supplies',
    categoryId: '2078',
  },
  {
    id: '10',
    name: 'الكيسات',
    image: '/nzxt-pc-case.jpg',
    slug: 'cases',
    categoryId: '2079',
  },
  {
    id: '11',
    name: 'M.2',
    image: '/kingston-ram-ddr5.jpg',
    slug: 'm2',
    categoryId: '2080',
  },
  {
    id: '12',
    name: 'المراوح',
    image: '/corsair-logo.jpg',
    slug: 'fans',
    categoryId: '2081',
  },
  {
    id: '13',
    name: 'الشاشات',
    image: '/placeholder.jpg',
    slug: 'monitors',
    categoryId: '2082',
  },
  {
    id: '14',
    name: 'ماوس',
    image: '/logitech-logo.jpg',
    slug: 'mouse',
    categoryId: '2087',
  },
]

export function CategoriesStrip({ categories = defaultCategories }: CategoriesStripProps) {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?c=${category.categoryId}&p=1&s=1`}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="relative w-20 h-20 rounded-full bg-muted border-2 border-border group-hover:border-primary transition-colors overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-contain p-2 transition-transform duration-300"
                  sizes="80px"
                />
              </div>
              <span className="text-sm text-muted-foreground text-center group-hover:text-primary transition-colors font-medium">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

