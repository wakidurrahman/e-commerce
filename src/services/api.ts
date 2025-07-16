import { PaginationParams, Product, ProductsResponse } from '@/types';
import axios, { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Handle common error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      switch (status) {
        case 404:
          throw new Error('Resource not found');
        case 500:
          throw new Error('Internal server error');
        case 503:
          throw new Error('Service unavailable');
        default:
          throw new Error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error - please check your connection');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Request configuration error');
    }
  }
);

// API functions
export const productApi = {
  // Get all products with pagination and filtering
  getProducts: async (
    params: PaginationParams = {}
  ): Promise<ProductsResponse> => {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'title',
      order = 'asc',
    } = params;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    let url = '/products';
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());

    // Add sorting parameters
    queryParams.append('sortBy', sortBy);
    queryParams.append('order', order);

    // Handle search
    if (search) {
      url = '/products/search';
      queryParams.append('q', search);
    }

    // Handle category filtering
    if (category && !search) {
      url = `/products/category/${encodeURIComponent(category)}`;
    }

    const fullUrl = `${url}?${queryParams.toString()}`;
    const response = await api.get<ProductsResponse>(fullUrl);

    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Get all product categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/products/categories');
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (
    category: string,
    params: Omit<PaginationParams, 'category'> = {}
  ): Promise<ProductsResponse> => {
    const { page = 1, limit = 20, sortBy = 'title', order = 'asc' } = params;

    const skip = (page - 1) * limit;
    const queryParams = new URLSearchParams();

    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('order', order);

    const url = `/products/category/${encodeURIComponent(
      category
    )}?${queryParams.toString()}`;
    const response = await api.get<ProductsResponse>(url);

    return response.data;
  },

  // Search products
  searchProducts: async (
    query: string,
    params: Omit<PaginationParams, 'search'> = {}
  ): Promise<ProductsResponse> => {
    const { page = 1, limit = 20, sortBy = 'title', order = 'asc' } = params;

    const skip = (page - 1) * limit;
    const queryParams = new URLSearchParams();

    queryParams.append('q', query);
    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('order', order);

    const url = `/products/search?${queryParams.toString()}`;
    const response = await api.get<ProductsResponse>(url);

    return response.data;
  },
};

// Export default api instance for custom requests
export default api;
