import Link from 'next/link'
import { Search, Languages, Home, Gamepad2, Package, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function TopBar() {
  return (
    <div className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT - External links/icons (RTL) */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2 text-xs"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                MP4
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2 text-xs"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                MP3
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2 text-xs"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                write arabic
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2 text-xs"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </Button>
          </div>

          {/* CENTER - Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex items-center gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/" 
                      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-white"
                    >
                      <Home className="h-4 w-4" />
                      <span>الرئيسية</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/gaming-builds" 
                      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-white"
                    >
                      <Gamepad2 className="h-4 w-4" />
                      <span>تجميعات الألعاب</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-800 data-[state=open]:bg-gray-800 text-white text-sm font-medium px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>المنتجات</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[200px] p-2 bg-gray-900 border border-gray-800 rounded-lg">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/categories"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          جميع الفئات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/brands"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          الماركات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/search?filter=deals"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          العروض الخاصة
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/support" 
                      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-white"
                    >
                      <Headphones className="h-4 w-4" />
                      <span>تواصل معنا</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* RIGHT - Search, Login, Language, Logo (RTL) */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded text-xs md:text-sm h-8"
            >
              <Link href="/account">
                تسجيل الدخول
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 h-8 w-8"
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Link href="/" className="text-white font-bold text-lg md:text-xl">
              <div className="flex flex-col">
                <span>الرأي</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
