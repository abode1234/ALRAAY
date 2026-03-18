import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'بناء تجميعات الكمبيوتر',
    description: 'قم بتخصيص وبناء جهاز الكمبيوتر الذي تحلم به في العراق - اختر من أفضل المكونات بما في ذلك المعالجات (CPU)، ووحدات معالجة الرسوميات (GPU)، واللوحات الأم، وذاكرة الوصول العشوائي',
    openGraph: {
        title: 'بناء تجميعات الكمبيوتر | alraay',
        description: 'قم بتخصيص وبناء جهاز الكمبيوتر الذي تحلم به في العراق من شركة الرأي الشاملة',
        url: 'https://alraay.com/build-pc',
    },
    alternates: {
        canonical: 'https://alraay.com/build-pc',
    },
};

export default function BuildPCLayout({ children }: { children: React.ReactNode }) {
    return children;
}
