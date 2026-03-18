import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'التجميعات الجاهزة',
    description: 'تجميعات كمبيوتر جاهزة ومخصصة من شركة الرأي الشاملة - تجميعات ألعاب، تجميعات عمل، تجميعات تصميم بأفضل الأسعار',
    openGraph: {
        title: 'التجميعات الجاهزة | alraay',
        description: 'تجميعات كمبيوتر جاهزة ومخصصة من شركة الرأي الشاملة',
        url: 'https://alraay.com/bundles',
    },
    alternates: {
        canonical: 'https://alraay.com/bundles',
    },
};

export default function BundlesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
