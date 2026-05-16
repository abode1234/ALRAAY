const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alraay.net/api';


export interface Section {
  id: string;
  title: string;
  slug: string;
  type: 'PRODUCT' | 'BUILD' | 'MIXED';
  order: number;
  isActive: boolean;
  items: Array<{
    product: Product;
    build?: any;
  }>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  brand: string;
  images: string[];
  category: string;
  stock: number;
  specifications: Record<string, any>;
  avgRating: number;
  totalReviews: number;
  isNewArrival?: boolean;
  powerConsumption?: number;
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isNewArrival?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  hasDiscount?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  position: 'MAIN_SLIDER' | 'SECONDARY_TOP' | 'SECONDARY_BOTTOM';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuildComponent {
  id: string;
  category: string;
  product: Product;
  productId: string;
}

export interface Build {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  isTemplate: boolean;
  userId: string;
  discountAmount?: number | null;
  components: BuildComponent[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string;
  slug: string;
  categories?: string[];
  isActive: boolean;
}

export interface DisplayCategory {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon: string;
  link?: string;
  order: number;
  isActive: boolean;
}

class ApiClient {
  private baseUrl: string;
  private _isLoggedIn: boolean = false;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // cookies are sent automatically
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  setLoggedIn(value: boolean) {
    this._isLoggedIn = value;
  }

  clearTokens() {
    this._isLoggedIn = false;
  }

  // Products
  async getProducts(filters?: ProductFilter) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.isNewArrival !== undefined) params.append('isNewArrival', filters.isNewArrival.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.hasDiscount !== undefined) params.append('hasDiscount', filters.hasDiscount.toString());

    const queryString = params.toString();
    const response = await this.request<any>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
    // Normalize response: backend returns { data, meta: { total, page, totalPages } }
    return {
      data: response.data || [],
      total: response.meta?.total ?? response.total ?? 0,
      page: response.meta?.page ?? response.page ?? 1,
      totalPages: response.meta?.totalPages ?? response.totalPages ?? 1,
    };
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  // Guest Cart helpers
  private getGuestCart(): Array<{ productId: string; quantity: number; product?: Product; components?: any }> {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem('guestCart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  private saveGuestCart(items: Array<{ productId: string; quantity: number; product?: Product; components?: any }>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('guestCart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  // Cart
  async getCart() {
    if (this.isLoggedIn()) {
      try {
        return await this.request<any>('/cart');
      } catch {
        return { items: [], total: 0, itemCount: 0 };
      }
    }
    // Guest cart
    const guestItems = this.getGuestCart();
    const total = guestItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
    return {
      items: guestItems.map((item, index) => ({
        id: `guest-${index}`,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        buildComponents: item.components || null,
        customPrice: null,
      })),
      total,
      itemCount: guestItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addBuildToCart(components: any, discountAmount?: number) {
    return this.request('/cart/build', {
      method: 'POST',
      body: JSON.stringify({ components, discountAmount: discountAmount || undefined }),
    });
  }

  async addToCart(productId: string, quantity: number = 1, components?: any) {
    if (this.isLoggedIn()) {
      return this.request('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, components }),
      });
    }
    // Guest cart - save to localStorage
    const guestCart = this.getGuestCart();
    // Fetch product info for display
    let product: Product | undefined;
    try {
      product = await this.getProduct(productId);
    } catch {
      // If we can't fetch product, still add to cart with minimal info
    }

    if (components) {
      // Custom builds always get their own entry
      guestCart.push({ productId, quantity, product, components });
    } else {
      // Check if product already in cart
      const existingIndex = guestCart.findIndex(item => item.productId === productId && !item.components);
      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += quantity;
      } else {
        guestCart.push({ productId, quantity, product });
      }
    }
    this.saveGuestCart(guestCart);
    return { message: 'Added to guest cart' };
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    if (this.isLoggedIn()) {
      return this.request(`/cart/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    }
    // Guest cart
    const guestCart = this.getGuestCart();
    const index = parseInt(cartItemId.replace('guest-', ''));
    if (!isNaN(index) && guestCart[index]) {
      guestCart[index].quantity = quantity;
      this.saveGuestCart(guestCart);
    }
    return { message: 'Updated guest cart' };
  }

  async removeFromCart(cartItemId: string) {
    if (this.isLoggedIn()) {
      return this.request(`/cart/${cartItemId}`, {
        method: 'DELETE',
      });
    }
    // Guest cart
    const guestCart = this.getGuestCart();
    const index = parseInt(cartItemId.replace('guest-', ''));
    if (!isNaN(index) && guestCart[index]) {
      guestCart.splice(index, 1);
      this.saveGuestCart(guestCart);
    }
    return { message: 'Removed from guest cart' };
  }

  // Sync guest cart to server after login
  private async syncGuestCart() {
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      try {
        await this.request('/cart', {
          method: 'POST',
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            components: item.components,
          }),
        });
      } catch (error) {
        console.error('Failed to sync guest cart item:', error);
      }
    }
    // Clear guest cart after sync
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestCart');
    }
  }

  // Wishlist
  async getWishlist() {
    return this.request<any>('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    const response: any = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    // Cookie is set automatically by the backend
    this._isLoggedIn = true;
    // Sync guest cart to server after registration
    await this.syncGuestCart();
    window.dispatchEvent(new Event('cart-updated'));

    return response;
  }

  async login(email: string, password: string) {
    const response: any = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Cookie is set automatically by the backend
    this._isLoggedIn = true;
    // Sync guest cart to server after login
    await this.syncGuestCart();
    window.dispatchEvent(new Event('cart-updated'));

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
    return response;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Reviews
  async getProductReviews(productId: string) {
    return this.request<any>(`/reviews/${productId}`);
  }

  async createReview(productId: string, rating: number, comment?: string) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment }),
    });
  }

  // Filters
  async getFilters() {
    return this.request<any>('/filters');
  }

  // Sections
  async getSections() {
    return this.request<Section[]>('/sections');
  }

  // Orders
  async getOrders() {
    return this.request<any>('/orders');
  }

  async createOrder(shippingAddress: any, paymentMethod?: 'SINDIPAY' | 'COD', couponCode?: string) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod, couponCode }),
    });
  }

  // Banners
  async getBanners(includeInactive = false) {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.request<Banner[]>(`/banners${params}`);
  }

  async getActiveBanners() {
    return this.request<Banner[]>('/banners/active');
  }

  // Brands
  async getBrands() {
    return this.request<Brand[]>('/brands');
  }

  async getBrandsByCategory(category: string) {
    return this.request<Brand[]>(`/brands/category/${category}`);
  }

  // Display Categories
  async getDisplayCategories(includeInactive = false) {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.request<DisplayCategory[]>(`/display-categories${params}`);
  }

  async getActiveDisplayCategories() {
    return this.request<DisplayCategory[]>('/display-categories/active');
  }

  // Build PC / Bundles
  async getBuilds(templatesOnly = false) {
    const params = templatesOnly ? '?templates=true' : '';
    return this.request<Build[]>(`/build-pc${params}`);
  }

  async getBuild(id: string) {
    return this.request<Build>(`/build-pc/${id}`);
  }

  async createBuild(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    isTemplate?: boolean;
    components: Array<{ productId: string; category: string }>;
  }) {
    return this.request<Build>('/build-pc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBuild(id: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }) {
    return this.request<Build>(`/build-pc/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateBuildComponent(id: string, category: string, productId: string) {
    return this.request(`/build-pc/${id}/components/${category}`, {
      method: 'PATCH',
      body: JSON.stringify({ productId }),
    });
  }

  async removeBuildComponent(id: string, category: string) {
    return this.request(`/build-pc/${id}/components/${category}`, {
      method: 'DELETE',
    });
  }

  async deleteBuild(id: string) {
    return this.request(`/build-pc/${id}`, {
      method: 'DELETE',
    });
  }

  async calculatePowerSupply(id: string) {
    return this.request<{ totalPower: number; recommendedPSU: number }>(`/build-pc/${id}/power-calculator`);
  }

  // Payments
  async initiatePayment(data: {
    orderId: string;
    order_id: string;
    title: string;
    total_amount: number;
    currency?: 'IQD';
    locale?: 'en' | 'ar';
    callback_url: string;
    webhook_url?: string;
  }): Promise<{ payment: any; redirectUrl: string }> {
    return this.request('/paymants/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserPayments(): Promise<any[]> {
    return this.request('/paymants/my');
  }

  async retrievePayment(sindiPayId: number): Promise<any> {
    return this.request(`/paymants/retrieve/${sindiPayId}`);
  }

  async getPaymentStatus(sindiPayId: number): Promise<{ status: string; orderId: string | null }> {
    return this.request(`/paymants/status/${sindiPayId}`);
  }

  async getSettings(): Promise<{ buildDiscount: number | null }> {
    return this.request('/settings');
  }

  // Coupons
  async validateCoupon(code: string, cartItems: any[]): Promise<{
    isValid: boolean;
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
    message?: string;
  }> {
    return this.request(`/coupons/validate/${code}`, {
      method: 'POST',
      body: JSON.stringify({ cartItems }),
    });
  }
}

export const api = new ApiClient();
