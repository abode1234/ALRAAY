import * as XLSX from 'xlsx';

export const EXCEL_COLUMNS = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'الاسم' },
    { key: 'description', header: 'الوصف' },
    { key: 'price', header: 'السعر' },
    { key: 'compareAtPrice', header: 'السعر قبل الخصم' },
    { key: 'brand', header: 'الماركة' },
    { key: 'stock', header: 'المخزون' },
    { key: 'category', header: 'الفئة' },
    { key: 'socketType', header: 'نوع السوكت' },
    { key: 'memoryType', header: 'نوع الذاكرة' },
    { key: 'platform', header: 'المنصة' },
    { key: 'powerConsumption', header: 'استهلاك الطاقة (واط)' },
    { key: 'isNewArrival', header: 'وصل حديثاً' },
] as const;

export interface FieldChange {
    field: string;
    label: string;
    oldValue: any;
    newValue: any;
}

export interface UpdatePatch {
    id: string;
    productName: string;
    changes: Record<string, any>;
    details: FieldChange[];
}

export interface ImportResult {
    total: number;
    updated: number;
    skipped: number;
    errors: Array<{ id: string; row: number; error: string }>;
}

export function exportProductsToExcel(products: any[]) {
    const rows = products.map((product) => {
        const row: Record<string, any> = {};
        for (const column of EXCEL_COLUMNS) {
            let value = product[column.key];
            if (column.key === 'isNewArrival') value = value ? 'نعم' : 'لا';
            if (value === null || value === undefined) value = '';
            row[column.header] = value;
        }
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = EXCEL_COLUMNS.map((column) => ({ wch: Math.max(column.header.length * 2, 15) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `products-${date}.xlsx`);
}

export function parseExcelFile(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

                const headerToKey: Record<string, string> = {};
                for (const column of EXCEL_COLUMNS) {
                    headerToKey[column.header] = column.key;
                }

                const parsed = jsonRows.map((row) => {
                    const mapped: Record<string, any> = {};
                    for (const [header, value] of Object.entries(row)) {
                        const key = headerToKey[header];
                        if (key) mapped[key] = value;
                    }
                    return mapped;
                });

                if (parsed.length > 0 && !parsed[0].id) {
                    reject(new Error('الملف لا يحتوي على عمود ID'));
                    return;
                }

                for (const row of parsed) {
                    if (row.isNewArrival !== undefined) {
                        row.isNewArrival = row.isNewArrival === 'نعم' || row.isNewArrival === true;
                    }
                    if (row.price !== undefined && row.price !== '') row.price = Number(row.price);
                    if (row.compareAtPrice !== undefined && row.compareAtPrice !== '') row.compareAtPrice = Number(row.compareAtPrice);
                    if (row.stock !== undefined && row.stock !== '') row.stock = Number(row.stock);
                    if (row.powerConsumption !== undefined && row.powerConsumption !== '') row.powerConsumption = Number(row.powerConsumption);
                }

                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
        reader.readAsArrayBuffer(file);
    });
}

export function diffProducts(originals: any[], updated: Record<string, any>[]): UpdatePatch[] {
    const originalMap = new Map<string, any>();
    for (const product of originals) originalMap.set(product.id, product);

    const patches: UpdatePatch[] = [];
    const editableColumns = EXCEL_COLUMNS.filter((column) => column.key !== 'id');

    for (const row of updated) {
        if (!row.id) continue;
        const original = originalMap.get(row.id);
        if (!original) continue;

        const changes: Record<string, any> = {};
        const details: FieldChange[] = [];

        for (const column of editableColumns) {
            if (row[column.key] === undefined || row[column.key] === '') continue;
            const oldValue = original[column.key];
            const newValue = row[column.key];

            if (String(oldValue ?? '') !== String(newValue ?? '')) {
                changes[column.key] = newValue;
                details.push({ field: column.key, label: column.header, oldValue: oldValue ?? '', newValue });
            }
        }

        if (Object.keys(changes).length > 0) {
            patches.push({ id: row.id, productName: original.name || row.id, changes, details });
        }
    }

    return patches;
}