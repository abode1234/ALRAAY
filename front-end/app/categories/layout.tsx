import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'جميع التصنيفات',
    description: 'تصفح جميع تصنيفات منتجات الحاسبات وتقنيات المعلومات - معالجات، كروت شاشة، لوحات أم، ذاكرة عشوائية، أجهزة تخزين والمزيد',
    openGraph: {
        title: 'جميع التصنيفات | alraay',
        description: 'تصفح جميع تصنيفات منتجات الحاسبات وتقنيات المعلومات من شركة الرأي',
        url: 'https://alraay.com/categories',
    },
    alternates: {
        canonical: 'https://alraay.com/categories',
    },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
