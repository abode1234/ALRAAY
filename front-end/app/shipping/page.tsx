import { Truck, MapPin, Clock, Package, Search, Phone, Mail } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">سياسة التوصيل</h1>
        <p className="text-muted-foreground mb-8">
          في متجر الرأي، نلتزم بتوصيل المنتجات إلى عملائنا بأسرع وقت ممكن وبأفضل جودة. تهدف سياسة التوصيل لدينا إلى ضمان تجربة شراء مريحة وسهلة.
        </p>

        <div className="space-y-8">
          {/* مناطق التوصيل */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">١. مناطق التوصيل</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>نوفر التوصيل إلى جميع المحافظات داخل العراق.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>قد تختلف رسوم وأوقات التوصيل حسب الموقع الجغرافي للعميل.</span>
              </li>
            </ul>
          </div>

          {/* أوقات التوصيل */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٢. أوقات التوصيل</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يتم توصيل الطلبات خلال 2 إلى 5 أيام عمل من تاريخ تأكيد الطلب.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>قد تختلف أوقات التوصيل حسب توفر المنتج أو ظروف الشحن مثل العطلات الرسمية.</span>
              </li>
            </ul>
          </div>

          {/* رسوم التوصيل */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٣. رسوم التوصيل</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>تُحسب رسوم التوصيل بناءً على موقع العميل وتُعرض أثناء عملية الشراء.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>قد تُطبق رسوم إضافية للطلبات الكبيرة أو المخصصة.</span>
              </li>
            </ul>
          </div>

          {/* حالة المنتج عند التوصيل */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٤. حالة المنتج عند التوصيل</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>تُسلم المنتجات بحالتها الأصلية مع تغليف آمن لضمان الحماية أثناء الشحن.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>إذا كان المنتج تالفًا عند الاستلام، يحق للعميل رفض الطلب أو طلب استبداله وفق سياسة الاسترجاع.</span>
              </li>
            </ul>
          </div>

          {/* تتبع الطلبات */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٥. تتبع الطلبات</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يمكن للعملاء تتبع طلباتهم عبر التواصل مع فريق خدمة العملاء بالبريد الإلكتروني أو الهاتف.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>سنرسل تحديثات بخصوص حالة الطلب عبر الرسائل النصية أو البريد الإلكتروني.</span>
              </li>
            </ul>
          </div>

          {/* الاتصال بنا */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٦. الاتصال بنا</h2>
            </div>
            <p className="text-muted-foreground">
              لأي استفسارات أو مشاكل متعلقة بالتوصيل، يمكنكم التواصل معنا عبر البريد الإلكتروني:{' '}
              <a href="mailto:info@alraay.com" className="text-primary hover:underline">info@alraay.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
