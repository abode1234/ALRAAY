'use client';

import { useState, useEffect, useRef } from 'react';
import { formatPrice } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface PriceFilterProps {
    prices: number[];
    value: string;
    label: string;
    placeholder: string;
    onSelect: (price: string) => void;
}

export function PriceFilterButton({ prices, value, label, placeholder, onSelect }: PriceFilterProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm whitespace-nowrap ${value
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-secondary border-border hover:border-primary'
                    }`}
            >
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="font-medium">
                    {value ? formatPrice(Number(value)) + ' د.ع' : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full mt-2 right-0 bg-popover border border-border rounded-xl shadow-2xl z-50 w-56 overflow-hidden">
                    <div className="p-2 border-b border-border">
                        <button
                            onClick={() => { onSelect(''); setOpen(false); }}
                            className={`w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors ${!value ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            {placeholder}
                        </button>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-2 space-y-0.5">
                        {prices.map((price) => (
                            <button
                                key={price}
                                onClick={() => { onSelect(price.toString()); setOpen(false); }}
                                className={`w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors flex items-center justify-between ${value === price.toString() ? 'bg-primary/10 text-primary' : ''}`}
                            >
                                <span>{formatPrice(price)} د.ع</span>
                                {value === price.toString() && <Check className="h-3.5 w-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
