'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export interface Product {
  id: string
  name: string
  nameAr: string
  price: number
  originalPrice?: number
  compareAtPrice?: number
  image: string
  images?: string[]
  brand?: {
    name: string
    logo?: string
  }
  discount?: number
  inStock?: boolean
  isBuild?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const originalPrice = Number(product.compareAtPrice || product.originalPrice || 0)
  const currentPrice = Number(product.price)
  const discountPercentage = originalPrice && currentPrice < originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  const handleCardClick = (e: React.MouseEvent) => {
    if (onQuickView) {
      e.preventDefault()
      onQuickView(product)
    }
  }

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 h-full flex flex-col">
      <div onClick={handleCardClick} className={`${onQuickView ? 'cursor-pointer' : ''} flex-1 flex flex-col`}>
        {onQuickView ? (
          <div className="flex flex-col flex-1">
            {/* Product Image */}
            <div className="relative aspect-square bg-background overflow-hidden p-4">
              <Image
                src={product.image}
                alt={product.nameAr}
                fill
                className="object-contain p-2 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Discount Banner */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10 shadow-lg">
                  {discountPercentage}% خصم
                </div>
              )}

              {/* Brand Logo */}
              {product.brand?.logo && (
                <div className="absolute top-3 left-3 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg p-1.5 border border-white/10">
                  <Image
                    src={product.brand.logo}
                    alt={product.brand.name}
                    fill
                    className="object-contain inverted-brightness"
                    sizes="40px"
                  />
                </div>
              )}

              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-base font-medium text-foreground mb-3 line-clamp-2 h-[3rem] group-hover:text-primary transition-colors">
                {product.nameAr}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4 mt-auto">
                <p className="text-base sm:text-xl font-bold text-primary whitespace-nowrap">
                  {formatPrice(product.price)} د.ع
                </p>
                {originalPrice > 0 && originalPrice > currentPrice && (
                  <p className="text-sm text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(originalPrice)} د.ع
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/product/${product.id}`} className="block flex flex-col flex-1">
            {/* Product Image */}
            <div className="relative aspect-square bg-background overflow-hidden p-4">
              <Image
                src={product.image}
                alt={product.nameAr}
                fill
                className="object-contain p-2 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Discount Banner */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10 shadow-lg">
                  {discountPercentage}% خصم
                </div>
              )}

              {/* Brand Logo */}
              {product.brand?.logo && (
                <div className="absolute top-3 left-3 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg p-1.5 border border-white/10">
                  <Image
                    src={product.brand.logo}
                    alt={product.brand.name}
                    fill
                    className="object-contain inverted-brightness"
                    sizes="40px"
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-base font-medium text-foreground mb-3 line-clamp-2 h-[3rem] group-hover:text-primary transition-colors">
                {product.nameAr}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4 mt-auto">
                <p className="text-base sm:text-xl font-bold text-primary whitespace-nowrap">
                  {formatPrice(product.price)} د.ع
                </p>
                {originalPrice > 0 && originalPrice > currentPrice && (
                  <p className="text-sm text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(originalPrice)} د.ع
                  </p>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4 mt-auto">
        <Button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart?.(product.id)
          }}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
          disabled={product.inStock === false}
        >
          <ShoppingCart className="h-5 w-5 ml-2" />
          {product.inStock === false ? 'غير متوفر' : 'أضف للسلة'}
        </Button>
      </div>
    </div>
  )
}
