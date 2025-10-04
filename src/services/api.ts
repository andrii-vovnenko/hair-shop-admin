import axios from 'axios';

const API_BASE_URL = 'https://api.perukytyt.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on the API documentation
export interface Color {
  id: string;
  name: string;
  display_name: string;
  color_category: number;
}

export interface Product {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  type?: string;
  length?: number;
  base_price?: number;
  base_promo_price?: number;
  category_id: string;
  category?: string;
  variants?: Variant[];
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  promo_price?: number;
  color: string;
  stock_quantity: number;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
  sort_order: number;
}

export interface CreateColorRequest {
  name: string;
  display_name?: string;
  color_category?: number;
}

export interface CreateProductRequest {
  name: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  type?: string;
  length?: number;
  base_price?: number;
  base_promo_price?: number;
  category_id: string;
}

export interface CreateVariantRequest {
  product_id: string;
  sku: string;
  price: string;
  promo_price?: string;
  color: string;
  stock_quantity: string;
  images: File[];
}

// API functions
export const apiService = {
  // Colors
  createColor: async (data: CreateColorRequest): Promise<Color> => {
    const response = await api.post('/v1/colors', data);
    return response.data.color;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/v1/products');
    return response.data.products;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/v1/products/${id}`);
    return response.data.product;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/v1/products', data);
    return response.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/v1/products/${id}`);
  },

  // Variants
  createVariant: async (data: CreateVariantRequest): Promise<Variant> => {
    const formData = new FormData();
    formData.append('product_id', data.product_id);
    formData.append('sku', data.sku);
    formData.append('price', data.price);
    if (data.promo_price) {
      formData.append('promo_price', data.promo_price);
    }
    formData.append('color', data.color);
    formData.append('stock_quantity', data.stock_quantity);
    
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/v1/variants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.variant;
  },

  deleteVariant: async (id: string): Promise<void> => {
    await api.delete(`/v1/variants/${id}`);
  },

  addVariantImages: async (variantId: string, images: File[]): Promise<Image[]> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/v1/variants/${variantId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.images;
  },

  updateVariantSku: async (id: string, sku: string): Promise<void> => {
    await api.put(`/v1/variants/${id}/sku`, { sku });
  },

  // Images
  deleteImage: async (id: string): Promise<void> => {
    await api.delete(`/v1/images/${id}`);
  },
};

export default api;
