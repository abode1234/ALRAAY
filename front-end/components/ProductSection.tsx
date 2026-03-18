'use client'
import { ProductCard, Product } from './ProductCard'

interface ProductSectionProps {
  title: string
  products: Product[]
  onAddToCart?: (productId: string) => void
}

export function ProductSection({ title, products, onAddToCart }: ProductSectionProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-l from-primary to-transparent" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary to-transparent" />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
