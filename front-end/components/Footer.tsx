'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Facebook, Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              {mounted && (
                <img
                  src="/Al-Raay.svg"
                  alt="alraay"
                  className="h-16 w-auto transition-transform"
                />
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
              شركة الرأي الشاملة هي شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات، بدأت نشاطها منذ أكثر من ثلاثة عقود وأصبحت أحد الموردين البارزين في السوق العراقية.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.facebook.com/share/1CQCBPpTEG/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-secondary hover:bg-primary rounded-full flex items-center justify-center transition-colors text-foreground dark:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/alraay__?igsh=MThwY3JxOWJmcHlkNg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-secondary hover:bg-primary rounded-full flex items-center justify-center transition-colors text-foreground dark:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@alraay__?_r=1&_t=ZS-93iu3lzQ5TE"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-secondary hover:bg-primary rounded-full flex items-center justify-center transition-colors text-foreground dark:text-white"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-3">
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
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">السياسات</h4>
            <ul className="space-y-3">
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
            <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/SQA9setfvMo4TQ6J9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  بغداد، شارع صناعه، العراق
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+9647723440578" dir="ltr" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  +964 772 344 0578
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:info@aliyan.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  info@aliyan.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  السبت - الخميس: 9 صباحاً - 4 عصراً
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6">
          <p className="text-muted-foreground text-xs text-center">
            © {currentYear} شركة الرأي الشاملة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
