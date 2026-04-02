'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Search, ShoppingCart, User, Menu, X, Home, Package, Headphones, Cpu, LogOut, Tag, Gift, Grid3X3, Phone, Mail } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import { api, type Product } from '@/lib/api';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useIsMobile } from "@/components/ui/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await api.getProfile() as { name?: string };
        setIsLoggedIn(true);
        api.setLoggedIn(true);
        setUserName(profile.name || 'المستخدم');
      } catch (err: any) {
        console.error('Auth Check Error:', err);
        if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
          setIsLoggedIn(false);
          api.clearTokens();
        }
      }
    };
    checkAuth();
  }, []);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const cart = await api.getCart();
      const count = cart.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.getActiveDisplayCategories();
        setCategories(data.map(cat => ({
          name: cat.nameAr || cat.name,
          slug: cat.slug
        })));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    loadCategories();
  }, []);

  // Search suggestions
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.getProducts({ search: value.trim(), limit: 5 });
        setSearchSuggestions(res.data);
        setShowSuggestions(true);
      } catch {
        setSearchSuggestions([]);
      }
    }, 300);
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a')) return;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setIsLoggedIn(false);
      setUserName('');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      api.clearTokens();
      setIsLoggedIn(false);
      setUserName('');
      window.location.href = '/';
    }
  };

  // Search suggestions dropdown (shared between desktop and mobile)
  const SearchSuggestions = () => {
    if (!showSuggestions || searchSuggestions.length === 0) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-md z-50 overflow-hidden">
        {searchSuggestions.map((product) => (
          <a
            key={product.id}
            href={`/product/${product.id}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
            onClick={() => setShowSuggestions(false)}
          >
            {product.images?.[0] && (
              <img src={product.images[0]} alt="" className="w-9 h-9 object-contain rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-primary font-semibold">{Number(product.price).toLocaleString()} د.ع</p>
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <p className="text-xs text-muted-foreground line-through">{Number(product.compareAtPrice).toLocaleString()} د.ع</p>
                )}
              </div>
            </div>
          </a>
        ))}
        <a
          href={`/products?search=${encodeURIComponent(searchQuery)}`}
          className="block px-4 py-2.5 text-center text-sm text-primary hover:bg-muted transition-colors border-t border-border font-medium"
          onClick={() => setShowSuggestions(false)}
        >
          عرض جميع النتائج
        </a>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Zone 1: Top Info Bar (Announcement) */}
        <div className="hidden lg:block border-b border-border/30 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-10 text-xs">
              <div className="flex-1 opacity-0 pointer-events-none">
                {/* Spacer for centering */}
              </div>
              <div className="flex-1 flex justify-center text-center">
                <span className="text-primary font-bold text-sm tracking-wide">
                  أهلاً بكم في متجر الرأي - اكتشف أحدث العروض والتخفيضات!
                </span>
              </div>
              <div className="flex-1 flex items-center justify-end gap-5 text-muted-foreground">
                <a href="https://www.facebook.com/people/Al-RAY-TECH-%D8%A7%D9%84%D8%B1%D8%A3%D9%8A-%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A/61583788877750/?mibextid=wwXIfr&rdid=f18RQzqKR7aFlfzo&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1MzoXu3ruc%2F%3Fmibextid%3DwwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/al.raytech" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Instagram">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@alray.store?_r=1&_t=ZS-94u3zZ6d6Yh" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="TikTok">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Main Nav Row */}
        <div className="border-b border-border/40">
          <nav className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14 gap-4">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                {mounted && (
                  <img
                    src="/Al-Raay.svg"
                    alt="alraay"
                    className="h-9 w-auto"
                  />
                )}
              </Link>

              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl">
                <div className="relative w-full" ref={searchContainerRef}>
                  <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full h-10 px-4 pr-10 rounded-md border border-border bg-muted/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSuggestions(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <SearchSuggestions />
                </div>
              </form>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {isLoggedIn ? (
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (profileMenuTimer.current) clearTimeout(profileMenuTimer.current);
                      setShowProfileMenu(true);
                    }}
                    onMouseLeave={() => {
                      profileMenuTimer.current = setTimeout(() => setShowProfileMenu(false), 300);
                    }}
                  >
                    <button className="p-2 hover:bg-muted rounded-md transition-colors">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-background border border-border rounded-md shadow-md z-50">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium text-sm text-foreground">{userName}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/account"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>حسابي</span>
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            <span>طلباتي</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-amber-600"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>دخول</span>
                  </Link>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="lg:hidden flex items-center gap-1">
                <ThemeToggle />
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="p-2 text-foreground hover:text-primary transition-colors">
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80vw] sm:w-[320px] overflow-y-auto p-0">
                    <SheetHeader className="text-right p-4 border-b border-border">
                      <SheetTitle className="text-base">القائمة</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col py-2">
                      <SheetClose asChild>
                        <Link href="/" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>الرئيسية</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/products?isNewArrival=true&sortBy=createdAt&sortOrder=desc" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>وصل حديثاً</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/products" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>جميع المنتجات</span>
                        </Link>
                      </SheetClose>
                      <div className="h-px bg-border mx-4 my-1" />
                      <SheetClose asChild>
                        <Link href="/categories" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                          <span>جميع التصنيفات</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/bundles" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span>التجميعات</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/sales" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                          <Gift className="h-4 w-4 text-muted-foreground" />
                          <span>التخفيضات</span>
                        </Link>
                      </SheetClose>
                      <div className="h-px bg-border mx-4 my-1" />
                      {isLoggedIn ? (
                        <>
                          <SheetClose asChild>
                            <Link href="/account" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{userName || 'حسابي'}</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/orders" className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>طلباتي</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-sm w-full text-amber-600"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>تسجيل الخروج</span>
                            </button>
                          </SheetClose>
                        </>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 mx-4 my-2 px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium justify-center"
                          >
                            <User className="h-4 w-4" />
                            <span>تسجيل الدخول</span>
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </nav>
        </div>

        {/* Zone 3: Category Strip (Desktop) */}
        <div className="hidden lg:block bg-background">
          <nav className="container mx-auto px-4">
            <div className="flex items-center gap-1 h-10 overflow-x-auto">
              {[
                { label: 'الرئيسية', href: '/' },
                { label: 'بناء الكمبيوتر', href: '/build-pc' },
                { label: 'التجميعات', href: '/bundles' },
                { label: 'العلامات التجارية', href: '/brands' },
                { label: 'وصل حديثاً', href: '/products?isNewArrival=true&sortBy=createdAt&sortOrder=desc' },
                { label: 'التخفيضات', href: '/sales' },
                { label: 'جميع التصنيفات', href: '/categories' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden border-t border-border/30 bg-background">
          <form onSubmit={handleSearch} className="container mx-auto px-4 py-2">
            <div className="relative" ref={mobileSearchRef}>
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="w-full h-9 px-4 pr-9 rounded-md border border-border bg-muted/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                className="absolute left-0 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <SearchSuggestions />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 z-50 pb-safe">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
            <Home className="h-5 w-5" />
            <span className="text-[10px]">الرئيسية</span>
          </Link>

          <Link href="/build-pc" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
            <Cpu className="h-5 w-5" />
            <span className="text-[10px]">تجميعات</span>
          </Link>

          <MobileWhatsAppPopover />

          <Link href="/cart" className="relative flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className="text-[10px]">السلة</span>
          </Link>

          <Link href="/account" className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
            <User className="h-5 w-5" />
            <span className="text-[10px]">{isLoggedIn ? 'حسابي' : 'دخول'}</span>
          </Link>
        </div>
      </div>

      <DesktopWhatsAppButton />
    </>
  );
}

function WhatsAppPopoverContent() {
  const technicalSupportNumber = '9647736742199';
  const customerServiceNumber = '9647723440578';
  const technicalSupportMessage = 'مرحباً، أحتاج مساعدة فنية';
  const customerServiceMessage = 'مرحباً، لدي استفسار عن الطلب';
  const technicalSupportUrl = `https://api.whatsapp.com/send?phone=${technicalSupportNumber}&text=${encodeURIComponent(technicalSupportMessage)}`;
  const customerServiceUrl = `https://api.whatsapp.com/send?phone=${customerServiceNumber}&text=${encodeURIComponent(customerServiceMessage)}`;

  return (
    <PopoverContent side="top" align="center" className="text-center w-60 p-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">تواصل معنا عبر واتساب</p>
        <a
          href={technicalSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          الدعم الفني
        </a>
        <a
          href={customerServiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          خدمة الزبائن
        </a>
      </div>
    </PopoverContent>
  );
}

function MobileWhatsAppPopover() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex flex-col items-center justify-center -mt-6 bg-primary text-white rounded-full p-3 shadow-md ring-4 ring-background hover:bg-primary/90 transition-colors"
          aria-label="واتساب الدعم"
        >
          <Headphones className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <WhatsAppPopoverContent />
    </Popover>
  );
}

function DesktopWhatsAppButton() {
  const isMobile = useIsMobile();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  if (isMobile) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const currentTarget = e.currentTarget as HTMLElement;
    const initialRect = currentTarget.getBoundingClientRect();

    if (!position) {
      setPosition({ x: initialRect.left, y: initialRect.top });
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMovedRef.current = true;
      }
      setPosition((prev) => {
        if (!prev) {
          return { x: initialRect.left + deltaX, y: initialRect.top + deltaY };
        }
        return { x: prev.x + deltaX, y: prev.y + deltaY };
      });
      dragStartRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  const style: React.CSSProperties = position
    ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
    : {};

  return (
    <div
      className={`fixed z-50 ${!position ? 'bottom-6 right-6' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center justify-center bg-primary text-white rounded-full p-3.5 shadow-md hover:bg-primary/90 transition-colors cursor-move"
            aria-label="واتساب الدعم"
          >
            <Headphones className="h-6 w-6" />
          </button>
        </PopoverTrigger>
        <WhatsAppPopoverContent />
      </Popover>
    </div>
  );
}
