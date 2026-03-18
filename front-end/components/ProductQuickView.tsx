'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      loadSimilarProducts();
      setCurrentImageIndex(0);
    }
  }, [product, isOpen]);

  const loadSimilarProducts = async () => {
    if (!product) return;
    setLoadingSimilar(true);
    try {
      const response = await api.getProducts({
        category: product.category,
        limit: 20
      });
      // Filter out current product, shuffle, then take 4
      const filtered = response.data.filter((p: Product) => p.id !== product.id);
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setSimilarProducts(shuffled.slice(0, 4));
    } catch (error) {
      console.error('Failed to load similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await api.addToCart(product.id, 1);
      toast.success('تمت الإضافة إلى السلة');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة إلى السلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-2xl w-full max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">تفاصيل المنتج</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Image Section */}
            <div className="relative">
              <div className="aspect-square bg-card rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    لا توجد صورة
                  </div>
                )}

                {/* Image Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              {/* Brand */}
              <p className="text-primary font-medium mb-2">{product.brand}</p>

              {/* Name */}
              <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)} د.ع
                </span>
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <span className="text-lg text-gray-400 line-through mr-3">
                    {formatPrice(product.compareAtPrice)} د.ع
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500">
                    متوفر ({product.stock} قطعة)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-500">
                    غير متوفر
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">الوصف:</h3>
                  <p className="text-gray-400 leading-loose whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
                </button>
                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-accent transition-colors font-semibold"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          <div className="border-t border-border pt-8">
            <h3 className="text-xl font-bold mb-6">منتجات مشابهة</h3>

            {loadingSimilar ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-secondary rounded-xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-700 rounded-lg mb-3"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : similarProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    href={`/product/${similarProduct.id}`}
                    onClick={onClose}
                    className="bg-secondary rounded-xl overflow-hidden hover:bg-accent transition-colors group"
                  >
                    <div className="aspect-square bg-transparent relative">
                      {similarProduct.images && similarProduct.images[0] && (
                        <img
                          src={similarProduct.images[0]}
                          alt={similarProduct.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-1">{similarProduct.brand}</p>
                      <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {similarProduct.name}
                      </h4>
                      <p className="text-primary font-bold">
                        {formatPrice(similarProduct.price)} د.ع
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">لا توجد منتجات مشابهة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
