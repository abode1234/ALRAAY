'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Search, Home, Gamepad2, Package, Headphones, Languages, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { api } from '@/lib/api'

export default function Header() {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await api.getProfile()
        setUser(profile as { name: string; email: string })
      } catch (err) {
        console.error('Auth check failed:', err)
      }
    }

    checkAuth()
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="bg-primary text-white py-2 text-center text-sm font-medium relative">
          <div className="container mx-auto px-4">
            <p>توصيل لجميع مناطق العراق - بغداد: 5,000 د.ع | المحافظات: 10,000 د.ع</p>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-dark.svg"
                alt="الرأي"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  name="search"
                  className="w-full h-12 pr-12 pl-6 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="تبحث عن منتج معين؟"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                aria-label="اللغة"
              >
                <Languages className="h-5 w-5" />
              </Button>
              {user ? (
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                >
                  <Link href="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                >
                  <Link href="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    تسجيل الدخول
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center justify-center py-4 border-t border-gray-800">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex items-center gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      <Home className="h-4 w-4" />
                      الرئيسية
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/products?c=2086&p=1&s=1"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      <Gamepad2 className="h-4 w-4" />
                      تجميعات الألعاب
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-800 data-[state=open]:bg-gray-800 text-white text-sm font-medium px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      المنتجات
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[250px] p-2 bg-gray-900 border border-gray-800 rounded-lg">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          جميع المنتجات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2088&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          اكسسوارات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2086&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          تجميعات الألعاب
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2072&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          المعالجات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2073&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          كروت الشاشة
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2074&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          المذربوردات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2075&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          الرامات
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?c=2076&p=1&s=1"
                          className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-200"
                        >
                          التخزين
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/support"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      <Headphones className="h-4 w-4" />
                      تواصل معنا
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                name="search"
                className="w-full h-12 pr-12 pl-6 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="تبحث عن منتج معين؟"
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
