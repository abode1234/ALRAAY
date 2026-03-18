'use client';

import { Bell, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

export default function Header({ title }: { title: string }) {
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    useEffect(() => {
        const fetchNewOrders = async () => {
            try {
                const { count } = await adminApi.getNewOrdersCount();
                setNewOrdersCount(count);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchNewOrders();
        const interval = setInterval(fetchNewOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث..."
                        className="w-64 h-10 pr-10 pl-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Bell className="h-6 w-6 text-gray-600" />
                    {newOrdersCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                            {newOrdersCount}
                        </span>
                    )}
                </button>

                {/* User */}
                <div className="flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700 hidden md:block">المدير</span>
                </div>
            </div>
        </header>
    );
}
