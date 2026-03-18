import { Database, Settings, Shield, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
        <p className="text-muted-foreground mb-8">
          في شركة الرأي شاملة، نحن نلتزم بحماية خصوصية مستخدمينا. لا نقوم بجمع أي بيانات شخصية إلا عند الحاجة لتقديم الخدمة، مثل اسم المستخدم ورقم الهاتف أثناء إتمام الطلب.
        </p>

        <div className="space-y-8">
          {/* جمع المعلومات */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">١. جمع المعلومات</h2>
            </div>
            <p className="text-muted-foreground mb-3">المعلومات التي نقوم بجمعها:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>الاسم: نطلبه لتحديد هوية العميل أثناء الطلب.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>رقم الهاتف: نستخدمه للتواصل مع العميل بشأن الطلب.</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-3">
              نحن لا نجمع أي معلومات إضافية عن المستخدمين مثل الموقع، البريد الإلكتروني، أو بيانات الجهاز.
            </p>
          </div>

          {/* استخدام المعلومات */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٢. استخدام المعلومات</h2>
            </div>
            <p className="text-muted-foreground mb-3">يتم استخدام الاسم ورقم الهاتف فقط للأغراض التالية:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>إتمام عملية الطلب والتواصل بشأنها.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>تحسين الخدمة من خلال ملاحظات العملاء.</span>
              </li>
            </ul>
          </div>

          {/* حماية المعلومات */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٣. حماية المعلومات</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يتم تخزين المعلومات المقدمة بطريقة آمنة ومشفرة، ولا يتم مشاركتها مع أي أطراف خارجية إلا إذا تطلب الأمر الالتزام بالقانون.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يتم حذف البيانات فور انتهاء المعاملة أو بناءً على طلب المستخدم.</span>
              </li>
            </ul>
          </div>

          {/* حقوق المستخدمين */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٤. حقوق المستخدمين</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>يحق للمستخدم طلب حذف أو تعديل بياناته عبر التواصل معنا.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>نلتزم بعدم استخدام بياناتك لأي أغراض تسويقية أو إعلانية.</span>
              </li>
            </ul>
          </div>

          {/* الاتصال بنا */}
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">٥. الاتصال بنا</h2>
            </div>
            <p className="text-muted-foreground">
              لأي استفسارات أو طلبات متعلقة بسياسة الخصوصية، يمكنكم التواصل معنا عبر البريد الإلكتروني:{' '}
              <a href="mailto:info@aliyan.com" className="text-primary hover:underline">info@aliyan.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
