'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Search, ShoppingCart, User, Menu, X, Home, Package, Headphones, Cpu, LogOut, Tag, Gift, ChevronDown, Grid3X3 } from 'lucide-react';
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
  const [showMobileCategories, setShowMobileCategories] = useState(false);
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
        // Only log out if specifically unauthorized (401)
        if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
          setIsLoggedIn(false);
          api.clearTokens();
        }
        // Otherwise keep logged in content (or let it fail gracefully later) 
        // to avoid logging out on network errors
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

    // Listen for cart updates from other components
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
      // Don't close if clicking a link inside suggestions (let navigation happen)
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">


        {/* Main Navbar */}
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              {mounted && (
                <img
                  src="/Al-Raay.svg"
                  alt="alraay"
                  className="h-10 w-auto transition-transform"
                />
              )}
            </Link>

            {/* Mobile Menu Trigger & Theme Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2 text-foreground hover:text-primary transition-colors">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[350px] overflow-y-auto">
                  <SheetHeader className="text-right mb-6">
                    <SheetTitle>الأقسام</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Home className="h-5 w-5 text-primary" />
                        <span className="font-medium">الرئيسية</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/products?isNewArrival=true&sortBy=createdAt&sortOrder=desc"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Tag className="h-5 w-5 text-primary" />
                        <span className="font-medium">وصل حديثاً</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-medium">جميع المنتجات</span>
                      </Link>
                    </SheetClose>
                    <div className="h-px bg-border my-2" />
                    <SheetClose asChild>
                      <Link
                        href="/categories"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Grid3X3 className="h-5 w-5 text-primary" />
                        <span className="font-medium">جميع التصنيفات</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/bundles"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Cpu className="h-5 w-5 text-primary" />
                        <span className="font-medium">التجميعات</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/sales"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                      >
                        <Gift className="h-5 w-5 text-primary" />
                        <span className="font-medium">التخفيضات</span>
                      </Link>
                    </SheetClose>
                    <div className="h-px bg-border my-2" />
                    {isLoggedIn ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                          >
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-medium">{userName || 'حسابي'}</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right"
                          >
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">طلباتي</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-right w-full text-amber-600"
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">تسجيل الخروج</span>
                          </button>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white transition-colors text-right"
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">تسجيل الدخول</span>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full" ref={searchContainerRef}>
                <input
                  type="text"
                  placeholder="تبحث عن منتج معين؟"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full px-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <Search className="h-5 w-5" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSuggestions(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchSuggestions.map((product) => (
                      <a
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="w-10 h-10 object-contain rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-primary font-bold">{Number(product.price).toLocaleString()} د.ع</p>
                            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                              <p className="text-xs text-muted-foreground line-through">{Number(product.compareAtPrice).toLocaleString()} د.ع</p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                    <a
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="block px-4 py-3 text-center text-sm text-primary hover:bg-accent transition-colors border-t border-border"
                      onClick={() => setShowSuggestions(false)}
                    >
                      عرض جميع النتائج
                    </a>
                  </div>
                )}
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
              <ThemeToggle />
              <Link
                href="/cart"
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile or Login Button */}
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
                  <button
                    className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                      <User className="h-6 w-6" />
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-border">
                        <p className="font-semibold text-foreground">{userName}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/account"
                          className="flex items-center space-x-2 space-x-reverse px-4 py-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <User className="h-5 w-5" />
                          <span>حسابي</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center space-x-2 space-x-reverse px-4 py-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Package className="h-5 w-5" />
                          <span>طلباتي</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 space-x-reverse px-4 py-2 hover:bg-accent rounded-lg transition-colors text-red-500"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/account"
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors mr-6"
                >
                  <User className="h-5 w-5" />
                  <span>تسجيل الدخول</span>
                </Link>
              )}
            </div>

          </div>





          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center justify-around py-3 border-t border-border/40">
            <Link
              href="/"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>الرئيسية</span>
            </Link>

            <Link
              href="/build-pc"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>بناء الكمبيوتر</span>
            </Link>

            <Link
              href="/bundles"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>التجميعات</span>
            </Link>

            <Link
              href="/brands"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>العلامات التجارية</span>
            </Link>

            <Link
              href="/products?isNewArrival=true&sortBy=createdAt&sortOrder=desc"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>وصل حديثاً</span>
            </Link>

            <Link
              href="/sales"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>التخفيضات</span>
            </Link>

            <Link
              href="/categories"
              className="px-4 py-2 hover:text-primary transition-colors font-medium"
            >
              <span>جميع التصنيفات</span>
            </Link>

          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden py-3 border-t border-border/40">
            <div className="relative" ref={mobileSearchRef}>
              <input
                type="text"
                placeholder="تبحث عن منتج معين؟"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="w-full px-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Mobile Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {searchSuggestions.map((product) => (
                    <a
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-10 h-10 object-contain rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-primary font-bold">{Number(product.price).toLocaleString()} د.ع</p>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <p className="text-xs text-muted-foreground line-through">{Number(product.compareAtPrice).toLocaleString()} د.ع</p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                  <a
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    className="block px-4 py-3 text-center text-sm text-primary hover:bg-accent transition-colors border-t border-border"
                    onClick={() => setShowSuggestions(false)}
                  >
                    عرض جميع النتائج
                  </a>
                </div>
              )}
            </div>
          </form>
        </nav>
      </header >

      {/* Mobile Bottom Navigation */}
      < div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 z-50 pb-safe" >
        <div className="flex items-center justify-around p-3">
          <Link href="/" className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium">الرئيسية</span>
          </Link>

          <Link href="/build-pc" className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
            <Cpu className="h-6 w-6" />
            <span className="text-[10px] font-medium">تجميعات</span>
          </Link>


          {/* زر واتساب مع popover للموبايل */}
          <MobileWhatsAppPopover />

          <Link href="/cart" className="relative flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className="text-[10px] font-medium">السلة</span>
          </Link>

          <Link href="/account" className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors">
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium">{isLoggedIn ? 'حسابي' : 'دخول'}</span>
          </Link>
        </div>
      </div >

      {/* زر واتساب مع popover للدسكتوب */}
      < DesktopWhatsAppButton />
    </>
  );
}

// مكون محتوى الـ Popover المشترك
function WhatsAppPopoverContent() {
  const technicalSupportNumber = '9647736742199'; // رقم الدعم الفني
  const customerServiceNumber = '9647723440578'; // رقم خدمة الزبائن

  const technicalSupportMessage = 'مرحباً، أحتاج مساعدة فنية';
  const customerServiceMessage = 'مرحباً، لدي استفسار عن الطلب';

  const technicalSupportUrl = `https://api.whatsapp.com/send?phone=${technicalSupportNumber}&text=${encodeURIComponent(technicalSupportMessage)}`;
  const customerServiceUrl = `https://api.whatsapp.com/send?phone=${customerServiceNumber}&text=${encodeURIComponent(customerServiceMessage)}`;

  return (
    <PopoverContent side="top" align="center" className="text-center w-64">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted-foreground mb-2">تواصل معنا عبر واتساب</p>
        <a
          href={technicalSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          الدعم الفني
        </a>
        <a
          href={customerServiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-primary text-primary font-bold hover:bg-primary/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
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
          className="flex flex-col items-center justify-center -mt-8 bg-primary text-white rounded-full p-4 shadow-lg ring-4 ring-background hover:bg-primary-dark transition-all transform hover:-translate-y-1"
          aria-label="واتساب الدعم"
        >
          <Headphones className="h-6 w-6" />
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
    if (e.button !== 0) return; // Only left click

    // Capture initial rect synchronously for use in callbacks
    const currentTarget = e.currentTarget as HTMLElement;
    const initialRect = currentTarget.getBoundingClientRect();

    // Initialize position if needed (first drag)
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
          return {
            x: initialRect.left + deltaX,
            y: initialRect.top + deltaY
          };
        }
        return {
          x: prev.x + deltaX,
          y: prev.y + deltaY
        };
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

  // Intercept click if we dragged
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false; // Reset
    }
  };

  const style: React.CSSProperties = position
    ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
    : {}; // Default CSS handles bottom-6 right-6

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
            className="flex items-center justify-center bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-transform hover:scale-110 cursor-move ring-4 ring-background/50"
            aria-label="واتساب الدعم"
          >
            <Headphones className="h-8 w-8" />
          </button>
        </PopoverTrigger>
        <WhatsAppPopoverContent />
      </Popover>
    </div>
  );
}
