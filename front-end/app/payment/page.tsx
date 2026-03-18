import { CreditCard, Banknote, Lock, RotateCcw, Mail } from 'lucide-react';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">سياسة الدفع</h1>
        <p className="text-muted-foreground mb-8">
          في شركة الرأي شاملة، نسعى لتوفير خيارات دفع سهلة وآمنة لضمان راحة عملائنا وثقتهم أثناء إجراء المعاملات المالية.
        </p>

        <div className="space-y-8">
          {/* طرق الدفع المقبولة */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">١. طرق الدفع المقبولة</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>الدفع عند الاستلام (COD).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>الدفع الإلكتروني باستخدام البطاقات البنكية (فيزا/ماستر كارد).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>التحويلات البنكية المباشرة (في حالة الطلبات الكبيرة).</span>
              </li>
            </ul>
          </div>

          {/* تفاصيل الدفع عند الاستلام */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Banknote className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٢. تفاصيل الدفع عند الاستلام</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يمكن للعملاء اختيار الدفع عند استلام الطلب لضمان سهولة ومرونة الشراء.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يلتزم العميل بتوفير المبلغ المطلوب عند تسليم المنتج من قبل شركة الشحن أو المندوب.</span>
              </li>
            </ul>
          </div>

          {/* الدفع الإلكتروني */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٣. الدفع الإلكتروني</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>نحن نستخدم بوابات دفع آمنة معتمدة لضمان حماية بيانات العميل أثناء إجراء الدفع.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>جميع المعاملات المالية تتم باستخدام تقنيات التشفير الحديثة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>في حالة فشل المعاملة أو وجود مشكلة، يمكن للعميل التواصل معنا لحل المشكلة في أقرب وقت ممكن.</span>
              </li>
            </ul>
          </div>

          {/* سياسة الاسترداد */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٤. سياسة الاسترداد</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يتم استرداد المدفوعات بنفس طريقة الدفع الأصلية خلال 7 أيام عمل من الموافقة على طلب الاسترداد.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يجب أن يكون المنتج في حالته الأصلية ومؤهلاً للاسترداد وفقًا لسياسة الاسترجاع.</span>
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
              لأي استفسارات أو مشاكل متعلقة بالدفع، يمكنكم التواصل معنا عبر البريد الإلكتروني:{' '}
              <a href="mailto:info@aliyan.com" className="text-primary hover:underline">info@aliyan.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
