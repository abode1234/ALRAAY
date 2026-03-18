'use client';

import { useState, useEffect } from 'react';
import { Save, Settings2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
    const [buildDiscount, setBuildDiscount] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        adminApi.getSettings().then(s => {
            setBuildDiscount(s.buildDiscount != null ? String(s.buildDiscount) : '');
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminApi.updateSettings({
                buildDiscount: buildDiscount ? Number(buildDiscount) : null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64">
                <Header title="الإعدادات العامة" />
                <div className="p-6 max-w-xl">
                    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Settings2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">خصم بناء التجميعة</h3>
                                <p className="text-sm text-gray-500">يطبق تلقائياً على جميع المستخدمين عند بناء تجميعة مخصصة</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                        ) : (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    مبلغ الخصم (د.ع)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        value={buildDiscount}
                                        onChange={(e) => setBuildDiscount(e.target.value)}
                                        placeholder="0 — بدون خصم"
                                        className="flex-1 h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ'}
                                    </button>
                                </div>
                                {buildDiscount && Number(buildDiscount) > 0 && (
                                    <p className="text-sm text-green-600">
                                        سيظهر للمستخدمين خصم بقيمة <strong>{Number(buildDiscount).toLocaleString()} د.ع</strong> عند بناء أي تجميعة
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
