import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'التخفيضات والعروض',
    description: 'أفضل العروض والتخفيضات على قطع وتجميعات الكمبيوتر من شركة الرأي الشاملة - خصومات حصرية على المعالجات وكروت الشاشة والرامات',
    openGraph: {
        title: 'التخفيضات والعروض | alraay',
        description: 'أفضل العروض والتخفيضات على قطع وتجميعات الكمبيوتر من شركة الرأي الشاملة',
        url: 'https://alraay.com/sales',
    },
    alternates: {
        canonical: 'https://alraay.com/sales',
    },
};

export default function SalesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
