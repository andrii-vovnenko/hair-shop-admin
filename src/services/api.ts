import axios from 'axios';

const API_BASE_URL = 'https://api.perukytyt.com';
const bucketUrl = 'https://images.perukytyt.com/cdn-cgi/image';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get image URL by key
 * @param {string} key - Image key
 * @param {Object} options - Image options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {number} options.blur - Image blur
 * @param {number} options.quality - Image quality
 * @param {string} options.format - Image format
 * @returns {string} Image URL
 */
export const getImageUrlByKey = (
  key: string,
  {
    width,
    height,
    blur,
    quality = 80,
    format = 'webp'
  }: {
    width?: number;
    height?: number;
    blur?: number;
    quality?: number;
    format?: string;
  } = {}
) => {
  let filters = [
    width && `width=${width}`,
    height && `height=${height}`,
    blur && `blur=${blur}`,
    quality && `quality=${quality}`,
    format && `format=${format}`
  ].filter(Boolean).join(',')

  return `${bucketUrl}${filters ? `/${filters}` : ''}/${key}`
}

export const COLOR_CATEGORIES = {
  LIGHT: 1,
  DARK: 2
} as const;

export const HAIR_TYPES = {
  NATURAL: 1,
  SYNTHETIC: 2
} as const;

// Types based on the API documentation
export interface Color {
  id: string;
  name: string;
  display_name: string;
  color_category: number;
  created_at: string;
  updated_at: string;
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
  sort_order: number;
  price: number;
  promo_price?: number;
  color: string;
  stock_quantity: number;
  images: Image[];
  old_price?: number;
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

export interface UpdateProductRequest {
  name?: string;
  display_name?: string;
  description?: string;
  short_description?: string;
  type?: string;
  length?: number;
  base_price?: number;
  base_promo_price?: number;
  category_id?: string;
}

export interface UpdateVariantRequest {
  sku?: string;
  price?: number;
  promo_price?: number;
  color?: string;
  stock_quantity?: number;
}

// API functions
export const apiService = {
  
  login: async (email: string, password: string): Promise<{ success: boolean; token?: string }> => {
  const response = await api.post('/v1/login', { email, password });
  return response.data;
},

  // Colors
  getColors: async (): Promise<Color[]> => {
    const response = await api.get('/v1/colors');
    return response.data.colors;
  },

  createColor: async (data: CreateColorRequest): Promise<Color> => {
    const response = await api.post('/v1/colors', data);
    return response.data.color;
  },

  deleteColor: async (id: string): Promise<void> => {
  await api.delete(`/v1/colors/${id}`);
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

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await api.put(`/v1/products/${id}`, data);
    return response.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/v1/products/${id}`);
  },

  // Variants
  getVariants: async (): Promise<Variant[]> => {
    const response = await api.get('/v1/variants');
    return response.data.variants;
  },

  getVariant: async (id: string): Promise<Variant> => {
    const response = await api.get(`/v1/variants/${id}`);
    return response.data.variant;
  },

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

  updateVariant: async (id: string, data: UpdateVariantRequest): Promise<Variant> => {
    const response = await api.put(`/v1/variants/${id}`, data);
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

  // Resort variant images
  resortVariantImages: async (variantId: string, imageOrders: Array<{ id: string; sort_order: number }>): Promise<Image[]> => {
    const response = await api.put(`/v1/variants/${variantId}/images/resort`, {
      image_orders: imageOrders
    });
    return response.data.images;
  },
};

export default api;
