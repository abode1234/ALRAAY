'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Monitor,
    LayoutDashboard,
    Package,
    Tags,
    Image,
    ShoppingCart,
    LogOut,
    LayoutTemplate,
    Grid3X3,
    Cpu,
    Ticket,
    Settings2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

const menuItems = [
    { icon: LayoutDashboard, label: 'الرئيسية', href: '/' },
    { icon: ShoppingCart, label: 'طلبات السلة', href: '/orders/regular', badge: false },
    { icon: ShoppingCart, label: 'طلبات التجميعة', href: '/orders', badge: true },
    { icon: Monitor, label: 'التجميعات', href: '/bundles' },
    { icon: Package, label: 'المنتجات', href: '/products' },
    { icon: Tags, label: 'البراندات', href: '/brands' },
    { icon: Image, label: 'البانرات', href: '/banners' },
    { icon: LayoutTemplate, label: 'الأقسام', href: '/sections' },
    { icon: Grid3X3, label: 'التصنيفات', href: '/categories' },
    { icon: Cpu, label: 'التوافق', href: '/compatibility' },
    { icon: Ticket, label: 'أكواد الخصم', href: '/coupons' },
    { icon: Settings2, label: 'الإعدادات', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    useEffect(() => {
        const fetchNewOrders = async () => {
            try {
                const { count } = await adminApi.getNewOrdersCount();
                setNewOrdersCount(count);
            } catch (error) {
                console.error('Error fetching new orders count:', error);
            }
        };

        fetchNewOrders();
        const interval = setInterval(fetchNewOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        adminApi.clearToken();
        window.location.href = '/login';
    };

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white">alraay Admin</h1>
                <p className="text-sm text-gray-400 mt-1">لوحة التحكم</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors relative ${isActive
                                ? 'bg-gray-800 text-white border-l-2 border-emerald-500'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                            {item.badge && newOrdersCount > 0 && (
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md animate-pulse">
                                    {newOrdersCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
