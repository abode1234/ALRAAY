'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Build } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Package, Cpu, CircuitBoard, HardDrive, Gauge, ChevronLeft } from 'lucide-react';

// Helper to extract a component by category key
function getComponentByCategory(build: Build, ...keys: string[]) {
  return build.components.find(c => keys.some(k => c.category.toUpperCase().includes(k)));
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBundles() {
      try {
        const data = await api.getBuilds(true);
        setBundles(data);
      } catch (error) {
        console.error('Failed to load bundles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBundles();
  }, []);

  const calculateTotalPrice = (build: Build) => {
    return build.components.reduce((sum, comp) => sum + Number(comp.product.price), 0);
  };

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">التجميعات الجاهزة</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر من تجميعاتنا الجاهزة المصممة خصيصاً لاحتياجاتك، ويمكنك تعديل أي قطعة حسب رغبتك
          </p>
        </div>

        {/* Bundles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-md p-0 animate-pulse">
                <div className="aspect-[4/3] bg-secondary rounded-t-2xl" />
                <div className="p-6 space-y-4">
                  <div className="bg-secondary h-6 rounded w-2/3" />
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="bg-secondary h-12 rounded-lg" />
                    ))}
                  </div>
                  <div className="bg-secondary h-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
            <p className="text-muted-foreground text-xl">لا توجد تجميعات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const totalPrice = calculateTotalPrice(bundle);
              const cpu = getComponentByCategory(bundle, 'CPU');
              const gpu = getComponentByCategory(bundle, 'GPU');
              const ram = getComponentByCategory(bundle, 'RAM');
              const storage = getComponentByCategory(bundle, 'STORAGE', 'SSD', 'HDD', 'NVME');

              return (
                <div
                  key={bundle.id}
                  className="bg-card border border-border rounded-md overflow-hidden transition-all duration-300 group flex flex-col hover:border-[#06c6a1]/40"
                >
                  {/* Bundle Image */}
                  <div className="relative aspect-square bg-background overflow-hidden p-4 border-b border-border">
                    {bundle.imageUrl ? (
                      <img
                        src={bundle.imageUrl}
                        alt={bundle.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Package className="h-24 w-24 text-muted-foreground m-auto" />
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* Bundle Name */}
                    <h3 className="text-lg font-bold mb-4 leading-tight">{bundle.name}</h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {cpu && (
                        <div className="flex items-center gap-2 text-sm">
                          <Cpu className="h-4 w-4 flex-shrink-0" style={{ color: '#06c6a1' }} />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase block">CPU</span>
                            <p className="text-xs truncate">{cpu.product.name}</p>
                          </div>
                        </div>
                      )}
                      {gpu && (
                        <div className="flex items-center gap-2 text-sm">
                          <CircuitBoard className="h-4 w-4 flex-shrink-0" style={{ color: '#06c6a1' }} />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase block">GPU</span>
                            <p className="text-xs truncate">{gpu.product.name}</p>
                          </div>
                        </div>
                      )}
                      {ram && (
                        <div className="flex items-center gap-2 text-sm">
                          <HardDrive className="h-4 w-4 flex-shrink-0" style={{ color: '#06c6a1' }} />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase block">RAM</span>
                            <p className="text-xs truncate">{ram.product.name}</p>
                          </div>
                        </div>
                      )}
                      {storage && (
                        <div className="flex items-center gap-2 text-sm">
                          <HardDrive className="h-4 w-4 flex-shrink-0" style={{ color: '#06c6a1' }} />
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase block">Storage</span>
                            <p className="text-xs truncate">{storage.product.name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Price */}
                    <div className="flex flex-col justify-end items-end mb-4 pt-4 border-t border-border">
                      {bundle.discountAmount && Number(bundle.discountAmount) > 0 ? (
                        <>
                          <div className="flex justify-between w-full items-center mb-1">
                            <span className="text-xs text-green-500 font-bold whitespace-nowrap bg-green-500/10 px-2 py-0.5 rounded-md">
                              وفّرت {formatPrice(Number(bundle.discountAmount))} د.ع
                            </span>
                            <span className="text-xs line-through text-muted-foreground decoration-destructive/50">
                              {formatPrice(totalPrice)} د.ع
                            </span>
                          </div>
                          <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold" style={{ color: '#06c6a1' }}>
                              {formatPrice(totalPrice - Number(bundle.discountAmount))}
                            </span>
                            <span className="text-sm text-foreground mb-1">د.ع</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl font-bold" style={{ color: '#06c6a1' }}>
                            {formatPrice(totalPrice)}
                          </span>
                          <span className="text-sm text-foreground">د.ع</span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/bundles/${bundle.id}`}
                      className="block w-full text-center py-3 border-2 font-bold rounded-md hover:text-white transition-all duration-300"
                      style={{ borderColor: '#06c6a1', color: '#06c6a1' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#06c6a1'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#06c6a1'; }}
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Build Your Own */}
        <div className="mt-16 relative overflow-hidden rounded-md p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 198, 161, 0.15) 0%, rgba(6, 198, 161, 0.05) 50%, rgba(11, 63, 50, 0.08) 100%)',
            border: '1px solid rgba(6, 198, 161, 0.2)',
          }}
        >
          <Gauge className="h-14 w-14 mx-auto mb-5" style={{ color: '#06c6a1' }} />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">لا تجد ما يناسبك؟</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto">
            ابنِ جهازك الخاص من الصفر واختر كل قطعة بنفسك
          </p>
          <Link
            href="/build-pc"
            className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-md font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
            style={{ backgroundColor: '#06c6a1' }}
          >
            <span>ابدأ البناء</span>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
