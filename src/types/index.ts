// Product Types
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Checkout Types
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: ShippingInfo;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: Omit<PaymentInfo, 'cardNumber' | 'cvv'>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

// UI Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Hook Types
export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  isValid: boolean;
  handleChange: (name: keyof T, value: T[keyof T]) => void;
  handleSubmit: (onSubmit: (values: T) => void) => (e: React.FormEvent) => void;
  reset: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  handleBlur: (name: keyof T) => void;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setMultipleValues: (newValues: Partial<T>) => void;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: T[keyof T];
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => void;
    onBlur: () => void;
    error: string | undefined;
    isValid: boolean | undefined;
  };
  touched: Record<keyof T, boolean>;
}

export interface UseFetchProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export interface UseProductDetailsReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCartReturn {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isProductInCart: (productId: number) => boolean;
  getProductQuantity: (productId: number) => number;
  getCartItemByProductId: (productId: number) => CartItem | undefined;
  addOrUpdateCart: (product: Product, quantity?: number) => void;
}
