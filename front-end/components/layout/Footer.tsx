import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, Facebook, Twitter, MessageCircle, Ghost } from 'lucide-react'


export function Footer() {
  return (
    <footer id="footer-section" className="bg-background border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Column - Important Pages */}
          <div className="flex flex-col">
            <Link href="/" className="mb-6">
              <Image
                src="/logo-dark.svg"
                alt="الرأي"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <h3 className="text-lg font-bold text-foreground mb-4">صفحات هامة</h3>
            <div className="space-y-3">
              <Link
                href="/returns&replacements"
                className="flex items-center gap-2 text-foreground dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                الاستبدال والاسترجاع
              </Link>
              <Link
                href="/privacypolicy"
                className="flex items-center gap-2 text-foreground dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms&conditions"
                className="flex items-center gap-2 text-foreground dark:text-gray-300 hover:text-orange-500 transition-colors"
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                الشروط والأحكام
              </Link>
            </div>

            <hr className="my-6 border-border" />

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground mb-3">طرق الدفع</h3>
              <div className="flex gap-3">
                <div className="h-10 w-16 bg-secondary rounded flex items-center justify-center text-xs text-foreground dark:text-gray-400">
                  مدى
                </div>
                {/* Add other payment method icons */}
              </div>
            </div>

            {/* Delivery Methods */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">طرق التوصيل</h3>
              <div className="flex gap-3">
                <div className="h-10 w-16 bg-secondary rounded flex items-center justify-center text-xs text-foreground dark:text-gray-400">
                  أرامكس
                </div>
              </div>
            </div>
          </div>

          {/* Second Column - About & Contact */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-foreground mb-4">عن متجر الرأي</h3>
            <p className="text-foreground dark:text-gray-300 text-sm leading-relaxed mb-6">
              متجر عراقي بتشكيلة واسعة من تجميعات بيسي اقتصادية واحترافية بكروت شاشة متنوعة وتركيب احترافي بأفضل الأسعار، بضمان ودعم فني مميز
            </p>

            <hr className="mb-6 border-border" />

            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <div className="grid grid-cols-3 gap-3">
              <a
                href="https://www.instagram.com/al_ityan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-600 via-emerald-500 to-yellow-500 rounded-lg hover:scale-110 transition-transform"
                aria-label="إنستغرام"
              >
                <Instagram className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://www.youtube.com/@al-ityan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg hover:scale-110 transition-transform"
                aria-label="يوتيوب"
              >
                <Youtube className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://wa.me/9647500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg hover:scale-110 transition-transform"
                aria-label="واتساب"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://www.snapchat.com/add/al_ityan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-lg hover:scale-110 transition-transform"
                aria-label="سناب شات"
              >
                <Ghost className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://x.com/al_ityan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-black rounded-lg hover:scale-110 transition-transform border border-border"
                aria-label="تويتر"
              >
                <Twitter className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://www.facebook.com/al.ityan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg hover:scale-110 transition-transform"
                aria-label="فيسبوك"
              >
                <Facebook className="h-6 w-6 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-border text-center text-muted-foreground text-sm">
          <p>جميع الحقوق محفوظة لـ الرأي 2025 ©</p>
        </div>
      </div>
    </footer>
  )
}
