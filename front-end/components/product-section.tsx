import { ProductCard } from '@/components/product-card'
import type { Product } from '@/data/products'

interface ProductSectionProps {
  title: string
  products: Product[]
}

export function ProductSection({ title, products }: ProductSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
