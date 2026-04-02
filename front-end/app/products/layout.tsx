import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'المنتجات',
    description: 'تصفح جميع منتجات الحاسبات وتقنيات المعلومات - معالجات، كروت شاشة، لوحات أم، ذاكرة عشوائية، أجهزة تخزين، كيسات، مبردات والمزيد من شركة الرأي',
    openGraph: {
        title: 'المنتجات | alraay',
        description: 'تصفح جميع منتجات الحاسبات وتقنيات المعلومات من شركة الرأي',
        url: 'https://alraay.com/products',
    },
    alternates: {
        canonical: 'https://alraay.com/products',
    },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
