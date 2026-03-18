'use client';

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { api, type Product } from "@/lib/api";
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  // Load similar products when product is loaded
  useEffect(() => {
    async function loadSimilarProducts() {
      if (!product?.category) return;
      setLoadingSimilar(true);
      try {
        const response = await api.getProducts({
          category: product.category,
          limit: 6
        });
        setSimilarProducts(response.data.filter((p: Product) => p.id !== product.id).slice(0, 4));
      } catch (error) {
        console.error('Failed to load similar products:', error);
      } finally {
        setLoadingSimilar(false);
      }
    }
    loadSimilarProducts();
  }, [product]);

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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground text-xl">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}

          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                {product.images && (product.images[selectedImage] || product.images[0]) ? (
                  <Image
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-card rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.stock === 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                    غير متوفر
                  </span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    كمية محدودة
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground mb-4 whitespace-pre-line">{product.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">الماركة:</span>
                <Link
                  href={`/products?brand=${product.brand}`}
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  {product.brand}
                </Link>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-border py-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)} د.ع
                </span>
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)} د.ع
                  </span>
                )}
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    {Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}% خصم
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-2">
                الكمية المتوفرة: {product.stock}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'جاري الإضافة...' : product.stock === 0 ? 'غير متوفر' : 'أضف إلى السلة'}
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-accent transition border border-border">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">المواصفات</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">الفئة:</span> {product.category}
                </li>
                <li>
                  <span className="font-semibold text-foreground">الماركة:</span> {product.brand}
                </li>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-semibold text-foreground">{key}:</span> {String(value)}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-2xl font-bold mb-6">منتجات مشابهة</h3>
          {loadingSimilar ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-md p-4 animate-pulse border border-border">
                  <div className="aspect-square bg-secondary rounded-lg mb-3"></div>
                  <div className="bg-secondary h-4 rounded mb-2"></div>
                  <div className="bg-secondary h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct.id}
                  href={`/product/${similarProduct.id}`}
                  className="bg-card rounded-md overflow-hidden hover:shadow-sm transition-all group border border-border"
                >
                  <div className="aspect-square bg-card relative">
                    {similarProduct.images && similarProduct.images[0] && (
                      <img
                        src={similarProduct.images[0]}
                        alt={similarProduct.name}
                        className="w-full h-full object-contain p-2 transition-transform"
                      />
                    )}
                    {similarProduct.compareAtPrice && Number(similarProduct.compareAtPrice) > Number(similarProduct.price) && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {Math.round(((Number(similarProduct.compareAtPrice) - Number(similarProduct.price)) / Number(similarProduct.compareAtPrice)) * 100)}% خصم
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">{similarProduct.brand}</p>
                    <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {similarProduct.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-bold">
                        {formatPrice(similarProduct.price)} د.ع
                      </p>
                      {similarProduct.compareAtPrice && Number(similarProduct.compareAtPrice) > Number(similarProduct.price) && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(similarProduct.compareAtPrice)} د.ع
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد منتجات مشابهة</p>
          )}
        </div>
      </div>
    </div>
  );
}
