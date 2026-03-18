import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function TopSearchBar() {
  return (
    <div className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="ابحث عن منتج"
            className="h-14 pr-12 pl-6 rounded-md border-0 shadow-sm text-base bg-white focus-visible:ring-2 focus-visible:ring-teal-300"
          />
        </div>
      </div>
    </div>
  )
}
