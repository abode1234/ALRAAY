'use client';

import { useState } from 'react';
import { Headphones, MessageCircle, X } from 'lucide-react';

export default function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const openWhatsApp = (phone: string) => {
        const message = encodeURIComponent('مرحباً، لدي استفسار');
        window.open(`https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, '')}&text=${message}`, '_blank');
    };

    return (
        <div className="fixed bottom-6 left-4 sm:left-6 z-50 flex flex-col items-end gap-4">
            {/* Popover Menu */}
            {isOpen && (
                <div className="bg-card border border-border rounded-lg shadow-2xl p-4 w-[calc(100vw-2rem)] sm:w-64 max-w-64 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2">
                    <div className="text-center text-foreground font-medium mb-3">تواصل معنا عبر واتساب</div>
                    <div className="space-y-3">
                        <button
                            onClick={() => openWhatsApp('+9647736742199')}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-colors font-medium"
                        >
                            <MessageCircle className="h-5 w-5" />
                            الدعم الفني
                        </button>
                        <button
                            onClick={() => openWhatsApp('+9647723440578')}
                            className="w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/10 py-3 rounded-lg transition-colors font-medium"
                        >
                            <MessageCircle className="h-5 w-5" />
                            خدمة الزبائن
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={toggleOpen}
                className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 ring-4 ring-primary/30"
                aria-label="الدعم الفني"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Headphones className="h-7 w-7" />}
            </button>
        </div>
    );
}
