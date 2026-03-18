import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/data/products'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-700 bg-gray-800 hover:border-teal-600/50">
      <CardContent className="p-4">
        <div className="relative mb-4">
          {product.badge && (
            <div className="absolute top-2 right-2 z-10 bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold">
              خصم
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10 bg-gray-700/90 hover:bg-gray-700 rounded-full h-8 w-8"
          >
            <Heart className="h-4 w-4 text-gray-300 hover:text-teal-400" />
          </Button>
          <Link href={`/product/${product.id}`}>
            <div className="aspect-square bg-white dark:bg-transparent rounded-lg overflow-hidden mb-3 border border-gray-200 dark:border-gray-700">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.nameAr}
                width={300}
                height={300}
                className="w-full h-full object-contain transition-transform duration-300"
              />
            </div>
          </Link>
        </div>
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-gray-200 mb-2 line-clamp-2 text-sm leading-relaxed group-hover:text-teal-400 transition-colors">
            {product.nameAr}
          </h3>
          <div className="space-y-1">
            {product.originalPrice && (
              <p className="text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)} د.ع
              </p>
            )}
            <p className="text-lg font-bold text-teal-400">
              {formatPrice(product.price)} د.ع
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
