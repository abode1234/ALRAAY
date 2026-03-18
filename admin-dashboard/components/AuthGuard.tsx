'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminApi } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Allow access to login page
            if (pathname === '/login') {
                setAuthorized(true);
                return;
            }

            const token = localStorage.getItem('adminToken');
            if (!token) {
                setAuthorized(false);
                router.push('/login');
                return;
            }

            try {
                // Verify token is valid by making a stats request (lightweight)
                await adminApi.getStats();
                setAuthorized(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('adminToken');
                setAuthorized(false);
                router.push('/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Prevent flashing of protected content
    if (!authorized && pathname !== '/login') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
