import cartReducer from '@/store/cartSlice';
import { Product } from '@/types';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import ProductCard from '../ProductCard';

// Mock product data
const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'This is a test product',
  category: 'electronics',
  price: 99.99,
  discountPercentage: 10,
  rating: 4.5,
  stock: 50,
  tags: ['test', 'electronics'],
  brand: 'Test Brand',
  sku: 'TEST-001',
  weight: 100,
  dimensions: {
    width: 10,
    height: 5,
    depth: 2,
  },
  warrantyInformation: '1 year warranty',
  shippingInformation: 'Ships in 1-2 business days',
  availabilityStatus: 'In Stock',
  reviews: [
    {
      rating: 5,
      comment: 'Great product!',
      date: '2024-01-01T00:00:00.000Z',
      reviewerName: 'John Doe',
      reviewerEmail: 'john@example.com',
    },
  ],
  returnPolicy: '30-day return policy',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    barcode: '1234567890',
    qrCode: 'test-qr-code',
  },
  images: ['https://example.com/image1.jpg'],
  thumbnail: 'https://example.com/thumbnail.jpg',
};

// Test utilities
const createTestStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
  });
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  const queryClient = createTestQueryClient();

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </Provider>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument(); // Discounted price
    expect(screen.getByText('$99.99')).toBeInTheDocument(); // Original price
    expect(screen.getByText('-10%')).toBeInTheDocument(); // Discount badge
  });

  it('displays rating correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('(4.5)')).toBeInTheDocument();
    // Check for star icons
    const filledStars = screen.getAllByText('★'); // This might need adjustment based on actual star rendering
    expect(filledStars).toHaveLength(4); // 4 full stars for 4.5 rating
  });

  it('shows add to cart button for in-stock products', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    expect(addToCartButton).toBeInTheDocument();
    expect(addToCartButton).not.toBeDisabled();
  });

  it('shows out of stock for unavailable products', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availabilityStatus: 'Out of Stock',
      stock: 0,
    };

    renderWithProviders(<ProductCard product={outOfStockProduct} />);

    const outOfStockButton = screen.getByRole('button', {
      name: /out of stock/i,
    });
    expect(outOfStockButton).toBeInTheDocument();
    expect(outOfStockButton).toBeDisabled();
  });

  it('adds product to cart when add to cart button is clicked', async () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(screen.getByText('Added to cart!')).toBeInTheDocument();
    });
  });

  it('shows stock warning for low stock products', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock: 3,
    };

    renderWithProviders(<ProductCard product={lowStockProduct} />);

    expect(screen.getByText('Only 3 left!')).toBeInTheDocument();
  });

  it('renders product image with correct alt text', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const productImage = screen.getByAltText('Test Product');
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute(
      'src',
      'https://example.com/thumbnail.jpg'
    );
  });

  it('displays fallback image when image fails to load', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const productImage = screen.getByAltText('Test Product');

    // Simulate image error
    fireEvent.error(productImage);

    // Should show fallback icon
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('navigates to product details when title is clicked', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', '/products/1');
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithProviders(
      <ProductCard product={mockProduct} className="custom-class" />
    );

    const cardElement = container.querySelector('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });
});

// Integration test with cart functionality
describe('ProductCard Cart Integration', () => {
  it('updates button text when product is already in cart', async () => {
    const store = createTestStore();
    const queryClient = createTestQueryClient();

    // Pre-add product to cart
    store.dispatch({
      type: 'cart/addToCart',
      payload: { product: mockProduct, quantity: 1 },
    });

    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ProductCard product={mockProduct} />
        </QueryClientProvider>
      </Provider>
    );

    const addMoreButton = screen.getByRole('button', { name: /add more/i });
    expect(addMoreButton).toBeInTheDocument();
  });
});
