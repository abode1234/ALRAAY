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
        <aside className="fixed right-0 top-0 h-screen w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-emerald-700/50">
                <h1 className="text-2xl font-bold text-white">alraay Admin</h1>
                <p className="text-sm text-emerald-300 mt-1">لوحة التحكم</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${isActive
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                            {item.badge && newOrdersCount > 0 && (
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {newOrdersCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-emerald-700/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-emerald-200 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
