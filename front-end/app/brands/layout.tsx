import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'العلامات التجارية - الوكلاء',
    description: 'تعرف على العلامات التجارية العالمية التي نوزعها في العراق - وكلاء معتمدون لأفضل ماركات الحاسبات وتقنيات المعلومات',
    openGraph: {
        title: 'العلامات التجارية - الوكلاء | alraay',
        description: 'تعرف على العلامات التجارية العالمية التي نوزعها في العراق من شركة الرأي',
        url: 'https://alraay.com/brands',
    },
    alternates: {
        canonical: 'https://alraay.com/brands',
    },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
