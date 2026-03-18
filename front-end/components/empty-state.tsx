import { Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  subtitle: string
  buttonText?: string
  buttonHref?: string
}

export function EmptyState({ title, subtitle, buttonText = 'عودة للرئيسية', buttonHref = '/' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">{subtitle}</p>
      <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  )
}
