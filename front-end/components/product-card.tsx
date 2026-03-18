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
    <Card className="group overflow-hidden hover:shadow-sm transition-shadow duration-200 border-border bg-card">
      <CardContent className="p-3">
        <div className="relative mb-3">
          {product.badge && (
            <div className="absolute top-2 right-2 z-10 bg-primary text-white px-2 py-0.5 rounded text-xs font-medium">
              خصم
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10 bg-background/80 hover:bg-background rounded-md h-7 w-7"
          >
            <Heart className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Link href={`/product/${product.id}`}>
            <div className="aspect-square bg-white dark:bg-muted/20 rounded-md overflow-hidden border border-border">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.nameAr}
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-foreground mb-1.5 line-clamp-2 text-sm leading-relaxed group-hover:text-primary transition-colors">
            {product.nameAr}
          </h3>
          <div className="space-y-0.5">
            {product.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)} د.ع
              </p>
            )}
            <p className="text-base font-semibold text-primary">
              {formatPrice(product.price)} د.ع
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
