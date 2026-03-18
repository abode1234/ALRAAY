'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const page = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="mt-12 flex justify-center dir-rtl">
            <div className="flex gap-2">
                {page > 1 && (
                    <Link
                        href={createPageURL(page - 1)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-colors flex items-center gap-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span>السابق</span>
                    </Link>
                )}

                {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 2 && pageNum <= page + 2)) {
                        return (
                            <Link
                                key={pageNum}
                                href={createPageURL(pageNum)}
                                className={`px-4 py-2 rounded-lg transition-colors border ${page === pageNum
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-600 hover:text-emerald-600'
                                    }`}
                            >
                                {pageNum}
                            </Link>
                        );
                    } else if (pageNum === page - 3 || pageNum === page + 3) {
                        return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                    }
                    return null;
                })}

                {page < totalPages && (
                    <Link
                        href={createPageURL(page + 1)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-colors flex items-center gap-2"
                    >
                        <span>التالي</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
