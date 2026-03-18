const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alraay.com/api';

export interface BuildComponent {
    id: string;
    category: string;
    product: {
        id: string;
        name: string;
        nameAr?: string;
        price: number;
        images?: string[];
    };
}

export interface Build {
    id: string;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    isTemplate: boolean;
    components: BuildComponent[];
    createdAt?: string;
    updatedAt?: string;
}

class AdminApi {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminToken', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminToken');
        }
        return null;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
        }
    }

    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || 'An error occurred');
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        const data = await this.fetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.accessToken);
        return data;
    }

    // Dashboard Stats
    async getStats() {
        return this.fetch<{
            totalProducts: number;
            totalOrders: number;
            totalUsers: number;
            revenue: number;
        }>('/admin/stats');
    }

    // Build Orders
    async getBuildOrders(status?: string) {
        const query = status ? `?status=${status}` : '';
        return this.fetch<any[]>(`/admin/build-orders${query}`);
    }

    async getBuildOrderStats() {
        return this.fetch<any>('/admin/build-orders/stats');
    }

    async getNewOrdersCount() {
        return this.fetch<{ count: number }>('/admin/build-orders/new-count');
    }

    async updateBuildOrderStatus(id: string, status: string) {
        return this.fetch<any>(`/admin/build-orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Regular Orders (from cart)
    async getOrders(status?: string) {
        const query = status ? `?status=${status}` : '';
        return this.fetch<any[]>(`/admin/orders${query}`);
    }

    async updateOrderStatus(id: string, status: string, trackingNumber?: string) {
        return this.fetch<any>(`/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, trackingNumber }),
        });
    }

    // Products
    async getProducts(params?: { page?: number; limit?: number; category?: string }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        if (params?.category) query.set('category', params.category);
        return this.fetch<{ data: any[]; total: number }>(`/products?${query}`);
    }

    async getProduct(id: string) {
        return this.fetch<any>(`/products/${id}`);
    }

    async createProduct(data: any) {
        return this.fetch<any>('/admin/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProduct(id: string, data: any) {
        return this.fetch<any>(`/admin/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteProduct(id: string) {
        return this.fetch<any>(`/admin/products/${id}`, {
            method: 'DELETE',
        });
    }

    // Brands
    async getBrands() {
        return this.fetch<any[]>('/brands');
    }

    async getBrandsByCategory(category: string) {
        return this.fetch<any[]>(`/brands/category/${category}`);
    }

    async createBrand(data: { name: string; nameAr?: string; logo?: string; slug: string }) {
        return this.fetch<any>('/admin/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBrand(id: string, data: any) {
        return this.fetch<any>(`/admin/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteBrand(id: string) {
        return this.fetch<any>(`/admin/brands/${id}`, {
            method: 'DELETE',
        });
    }

    // Banners
    async getBanners(position?: string) {
        const query = position ? `?position=${position}` : '';
        return this.fetch<any[]>(`/banners${query}`);
    }

    async createBanner(data: any) {
        return this.fetch<any>('/banners', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBanner(id: string, data: any) {
        return this.fetch<any>(`/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteBanner(id: string) {
        return this.fetch<any>(`/banners/${id}`, {
            method: 'DELETE',
        });
    }

    // Filters
    async getFilters() {
        return this.fetch<any>('/filters');
    }

    // Bundles / Build PC
    async getBuilds(templatesOnly = false) {
        const query = templatesOnly ? '?templates=true' : '';
        return this.fetch<any[]>(`/build-pc${query}`);
    }

    async createBuild(data: any) {
        return this.fetch<any>('/build-pc', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getBuild(id: string) {
        return this.fetch<any>(`/build-pc/${id}`);
    }

    async updateBuild(id: string, data: any) {
        return this.fetch<any>(`/build-pc/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteBuild(id: string) {
        return this.fetch<any>(`/build-pc/${id}`, {
            method: 'DELETE',
        });
    }

    // Image Upload
    async uploadImage(file: File): Promise<{
        id: string;
        filename: string;
        path: string;
        url: string;
        mimetype: string;
        size: number;
    }> {
        const token = this.getToken();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload/single`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || 'An error occurred');
        }

        return response.json();
    }

    async uploadMultipleImages(files: File[]): Promise<Array<{
        id: string;
        filename: string;
        path: string;
        url: string;
        mimetype: string;
        size: number;
    }>> {
        const token = this.getToken();
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_URL}/upload/multiple`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || 'An error occurred');
        }

        return response.json();
    }

    async getImages() {
        return this.fetch<Array<{
            id: string;
            filename: string;
            path: string;
            url: string;
            mimetype: string;
            size: number;
            createdAt: string;
        }>>('/upload');
    }

    async deleteImage(id: string) {
        return this.fetch<any>(`/upload/${id}`, {
            method: 'DELETE',
        });
    }

    // Sections
    async getSections() {
        return this.fetch<any[]>('/sections');
    }

    async createSection(data: any) {
        return this.fetch<any>('/sections', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSection(id: string, data: any) {
        return this.fetch<any>(`/sections/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteSection(id: string) {
        return this.fetch<any>(`/sections/${id}`, {
            method: 'DELETE',
        });
    }

    // Display Categories
    async getDisplayCategories() {
        return this.fetch<any[]>('/display-categories?includeInactive=true');
    }

    async createDisplayCategory(data: {
        name: string;
        nameAr: string;
        slug: string;
        icon: string;
        link?: string;
        order?: number;
        isActive?: boolean;
    }) {
        return this.fetch<any>('/display-categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateDisplayCategory(id: string, data: any) {
        return this.fetch<any>(`/display-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteDisplayCategory(id: string) {
        return this.fetch<any>(`/display-categories/${id}`, {
            method: 'DELETE',
        });
    }

    // Coupons
    async getCoupons() {
        return this.fetch<any[]>('/coupons');
    }

    async createCoupon(data: any) {
        return this.fetch<any>('/coupons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCoupon(id: string, data: any) {
        return this.fetch<any>(`/coupons/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteCoupon(id: string) {
        return this.fetch<any>(`/coupons/${id}`, {
            method: 'DELETE',
        });
    }

    async getSettings() {
        return this.fetch<{ buildDiscount: number | null }>('/settings');
    }

    async updateSettings(data: { buildDiscount?: number | null }) {
        return this.fetch<{ buildDiscount: number | null }>('/settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

export const adminApi = new AdminApi();
