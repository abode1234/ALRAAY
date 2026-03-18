import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Brand } from '@/data/brands'

interface BrandCardProps {
  brand: Brand
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.slug}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 border-gray-200">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <div className="w-full aspect-[3/2] relative mb-4">
            <Image
              src={brand.logo || "/placeholder.svg"}
              alt={brand.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
            {brand.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  )
}
