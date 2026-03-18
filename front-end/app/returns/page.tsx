import { RotateCcw, XCircle, ClipboardList, Banknote, Mail } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">سياسة الاسترجاع</h1>
        <p className="text-muted-foreground mb-8">
          في شركة الرأي شاملة، نحن نحرص على تقديم خدمة ممتازة وتجربة شراء مريحة. لذلك، نوفر سياسة استرجاع مرنة تضمن رضا العملاء وتلبية احتياجاتهم.
        </p>

        <div className="space-y-8">
          {/* شروط الاسترجاع */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">١. شروط الاسترجاع</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يمكن استرجاع المنتجات خلال 7 أيام من تاريخ استلامها.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يجب أن يكون المنتج في حالته الأصلية وغير مستخدم، مع جميع الملحقات والتغليف.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يجب تقديم إيصال الشراء أو إثبات الطلب عند طلب الاسترجاع.</span>
              </li>
            </ul>
          </div>

          {/* المنتجات غير القابلة للاسترجاع */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٢. المنتجات غير القابلة للاسترجاع</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>المنتجات المفتوحة أو المستخدمة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>المنتجات التالفة نتيجة سوء الاستخدام.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>المنتجات التي تنتمي إلى فئة العروض الخاصة أو التصفية (ما لم تكن تالفة).</span>
              </li>
            </ul>
          </div>

          {/* عملية الاسترجاع */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٣. عملية الاسترجاع</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يمكن تقديم طلب استرجاع من خلال التواصل معنا عبر البريد الإلكتروني أو رقم الهاتف.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>سيتم التحقق من الطلب والرد خلال 48 ساعة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>في حالة الموافقة، سيتم إرشادك لإعادة المنتج إلى عنوان الشركة.</span>
              </li>
            </ul>
          </div>

          {/* استرداد الأموال */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Banknote className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٤. استرداد الأموال</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يتم استرداد الأموال بنفس طريقة الدفع الأصلية خلال 7 أيام عمل من تاريخ استلام المنتج المرتجع.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>قد يتم خصم رسوم شحن أو رسوم إعادة تعبئة حسب الحالة.</span>
              </li>
            </ul>
          </div>

          {/* الاتصال بنا */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٥. الاتصال بنا</h2>
            </div>
            <p className="text-muted-foreground">
              لأي استفسارات أو طلبات متعلقة بسياسة الاسترجاع، يمكنكم التواصل معنا عبر البريد الإلكتروني:{' '}
              <a href="mailto:info@aliyan.com" className="text-primary hover:underline">info@aliyan.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
