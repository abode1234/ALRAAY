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
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="بحث..."
                        className="w-56 h-9 pr-9 pl-4 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Bell className="h-5 w-5 text-gray-500" />
                    {newOrdersCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {newOrdersCount}
                        </span>
                    )}
                </button>

                {/* User */}
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-600 hidden md:block text-sm">المدير</span>
                </div>
            </div>
        </header>
    );
}
