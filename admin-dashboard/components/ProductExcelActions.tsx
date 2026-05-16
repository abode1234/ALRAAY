'use client';

import { useRef, useState } from 'react';
import { Download, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { diffProducts, exportProductsToExcel, ImportResult, parseExcelFile, UpdatePatch } from '@/lib/excel-products';

type ImportState =
    | { phase: 'idle' }
    | { phase: 'parsing' }
    | { phase: 'confirming'; patches: UpdatePatch[]; skipped: number }
    | { phase: 'importing'; current: number; total: number }
    | { phase: 'done'; result: ImportResult };

interface Props {
    selectedCategory: string;
    onImportComplete: () => void;
}

export default function ProductExcelActions({ selectedCategory, onImportComplete }: Props) {
    const [exporting, setExporting] = useState(false);
    const [importState, setImportState] = useState<ImportState>({ phase: 'idle' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setExporting(true);
        try {
            const products = await adminApi.getAllProducts(selectedCategory);
            if (products.length === 0) {
                alert('لا توجد منتجات للتصدير');
                return;
            }
            exportProductsToExcel(products);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء التصدير');
        } finally {
            setExporting(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = '';
        setImportState({ phase: 'parsing' });

        try {
            const parsed = await parseExcelFile(file);
            const originals = await adminApi.getAllProducts(selectedCategory);
            const patches = diffProducts(originals, parsed);
            const skipped = parsed.length - patches.length;

            if (patches.length === 0) {
                setImportState({ phase: 'done', result: { total: parsed.length, updated: 0, skipped: parsed.length, errors: [] } });
                return;
            }

            setImportState({ phase: 'confirming', patches, skipped });
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء قراءة الملف');
            setImportState({ phase: 'idle' });
        }
    };

    const executeImport = async (patches: UpdatePatch[]) => {
        setImportState({ phase: 'importing', current: 0, total: patches.length });
        const errors: ImportResult['errors'] = [];
        let updated = 0;

        for (let index = 0; index < patches.length; index += 1) {
            setImportState({ phase: 'importing', current: index + 1, total: patches.length });
            try {
                await adminApi.updateProduct(patches[index].id, patches[index].changes);
                updated += 1;
            } catch (error: any) {
                errors.push({ id: patches[index].id, row: index + 2, error: error.message || 'فشل التحديث' });
            }
        }

        setImportState({ phase: 'done', result: { total: patches.length, updated, skipped: 0, errors } });
    };

    const closeModal = () => {
        if (importState.phase === 'done' && importState.result.updated > 0) {
            onImportComplete();
        }
        setImportState({ phase: 'idle' });
    };

    const renderButtons = () => (
        <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                تصدير Excel
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Upload className="h-5 w-5" />
                استيراد Excel
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
        </div>
    );

    return (
        <>
            {renderButtons()}

            {importState.phase !== 'idle' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" dir="rtl">
                        {importState.phase === 'parsing' && (
                            <div className="text-center py-8">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-600" />
                                <p className="text-gray-600">جاري تحليل الملف...</p>
                            </div>
                        )}

                        {importState.phase === 'confirming' && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">تأكيد الاستيراد</h3>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <p className="text-green-600 font-medium">{importState.patches.length} منتج سيتم تحديثه</p>
                                    <p className="text-gray-500 text-sm">{importState.skipped} منتج بدون تغييرات</p>
                                </div>
                                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                    {importState.patches.map((patch) => (
                                        <div key={patch.id} className="border border-gray-200 rounded-lg p-3">
                                            <p className="font-medium text-sm mb-2 text-gray-800">{patch.productName}</p>
                                            <div className="space-y-1">
                                                {patch.details.map((detail) => (
                                                    <div key={detail.field} className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-500 min-w-[80px]">{detail.label}:</span>
                                                        <span className="text-red-500 line-through">{String(detail.oldValue)}</span>
                                                        <span className="text-gray-400">←</span>
                                                        <span className="text-green-600 font-medium">{String(detail.newValue)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => executeImport(importState.patches)} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">تأكيد التحديث</button>
                                    <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">إلغاء</button>
                                </div>
                            </>
                        )}

                        {importState.phase === 'importing' && (
                            <div className="py-4">
                                <h3 className="text-lg font-bold mb-4">جاري التحديث...</h3>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                    <div className="bg-emerald-600 h-3 rounded-full transition-all duration-300" style={{ width: `${(importState.current / importState.total) * 100}%` }} />
                                </div>
                                <p className="text-sm text-gray-500 text-center">{importState.current} / {importState.total}</p>
                            </div>
                        )}

                        {importState.phase === 'done' && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">نتائج الاستيراد</h3>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {importState.result.updated > 0 && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span>تم تحديث {importState.result.updated} منتج</span></div>}
                                    {importState.result.skipped > 0 && <p className="text-gray-500">تم تجاهل {importState.result.skipped} منتج</p>}
                                    {importState.result.errors.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 text-red-600 mb-2"><AlertCircle className="h-5 w-5" /><span>{importState.result.errors.length} خطأ</span></div>
                                            <div className="max-h-32 overflow-y-auto text-sm bg-red-50 rounded-lg p-3 space-y-1">
                                                {importState.result.errors.map((error, index) => <p key={index} className="text-red-600">صف {error.row}: {error.error}</p>)}
                                            </div>
                                        </div>
                                    )}
                                    {importState.result.updated === 0 && importState.result.errors.length === 0 && <p className="text-gray-500 text-center py-4">لا توجد تغييرات</p>}
                                </div>
                                <button onClick={closeModal} className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">إغلاق</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}