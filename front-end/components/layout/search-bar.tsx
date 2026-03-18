import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchBar() {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          {/* Search bar centered */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="تبحث عن منتج معين؟"
              className="h-12 pr-12 pl-6 rounded-lg border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
