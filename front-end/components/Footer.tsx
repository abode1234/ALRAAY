'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-muted/30 border-t border-border mt-16 pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              {mounted && (
                <img
                  src="/Al-Raay.svg"
                  alt="alraay"
                  className="h-10 w-auto"
                />
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              شركة الرأي الشاملة - شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات منذ أكثر من ثلاثة عقود.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/share/1CQCBPpTEG/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/alraay__"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href="https://www.tiktok.com/@alraay__"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold mb-4 text-foreground tracking-wider">روابط سريعة</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  التصنيفات
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  العلامات التجارية
                </Link>
              </li>
              <li>
                <Link href="/build-pc" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  بناء الكمبيوتر
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-semibold mb-4 text-foreground tracking-wider">خدمة العملاء</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  سياسة التوصيل
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  سياسة الاسترجاع
                </Link>
              </li>
              <li>
                <Link href="/payment" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  سياسة الدفع
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold mb-4 text-foreground tracking-wider">تواصل معنا</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://maps.app.goo.gl/SQA9setfvMo4TQ6J9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  بغداد، شارع صناعه، العراق
                </a>
              </li>
              <li>
                <a href="tel:+9647723440578" dir="ltr" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  +964 772 344 0578
                </a>
              </li>
              <li>
                <a href="mailto:info@alraay.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  info@alraay.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4 flex-shrink-0" />
                السبت - الخميس: 9 صباحاً - 4 عصراً
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6">
          <p className="text-muted-foreground text-xs text-center">
            &copy; {currentYear} شركة الرأي الشاملة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
