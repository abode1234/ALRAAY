import Link from "next/link";
import { Package } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  showButton?: boolean;
}

export default function EmptyState({
  title = "لا توجد منتجات!",
  subtitle = "قم بإعادة ضبط فلاتر البحث أو العودة للرئيسية.",
  showButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">{subtitle}</p>
      {showButton && (
        <Link
          href="/"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
        >
          العودة للرئيسية
        </Link>
      )}
    </div>
  );
}

