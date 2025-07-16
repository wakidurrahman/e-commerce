# 🛒 NextShop - E-commerce Platform

A modern, secure, and scalable e-commerce frontend application built with **Next.js 15**, **React 19**, **TypeScript**, and **Redux Toolkit**. Features server-side rendering, optimized performance, and a comprehensive shopping experience.

## 🚀 **Live Demo**

- **Production:** [NextShop Live](https://your-deployment-url.vercel.app)
- **Staging:** [NextShop Staging](https://your-staging-url.vercel.app)

## ✨ **Features**

### 🛍️ **Core E-commerce Functionality**

- **Product Catalog** - Browse thousands of products with advanced filtering
- **Product Details** - Detailed product pages with image carousels and reviews
- **Shopping Cart** - Full cart management with persistent state
- **Checkout Flow** - Multi-step checkout with Zod schema validation
- **Search & Filters** - Debounced real-time search and category filtering

### ⚡ **Performance & UX**

- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Optimized Images** - Next.js Image component with lazy loading
- **Skeleton Loaders** - Smooth loading experiences
- **Responsive Design** - Mobile-first design with Bootstrap 5
- **Progressive Enhancement** - Works without JavaScript

### 🔧 **Technical Excellence**

- **TypeScript** - Full type safety throughout the application
- **Redux Toolkit** - Predictable state management with persistence
- **React Query** - Intelligent data fetching, caching, and optimistic updates
- **Custom Hooks** - Reusable business logic (useCart, useForm, useFetchProducts)
- **Zod Validation** - Runtime type checking and form validation
- **Debounced Search** - Performance-optimized search with useDebounce hook
- **Error Boundaries** - Graceful error handling and user feedback
- **Testing** - Comprehensive test coverage with Jest and RTL

## 🏗️ **Tech Stack**

| Category             | Technologies                 |
| -------------------- | ---------------------------- |
| **Framework**        | Next.js 15, React 19         |
| **Language**         | TypeScript                   |
| **State Management** | Redux Toolkit, Redux Persist |
| **Data Fetching**    | React Query (TanStack Query) |
| **Validation**       | Zod Schema Validation        |
| **Styling**          | Bootstrap 5, Custom CSS      |
| **API**              | DummyJSON API                |
| **Testing**          | Jest, React Testing Library  |
| **CI/CD**            | GitHub Actions               |
| **Deployment**       | Vercel, Docker               |

## 📦 **Project Structure**

```
nextshop/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── products/[id]/     # Product details
│   │   ├── cart/              # Shopping cart
│   │   └── checkout/          # Checkout flow
│   ├── components/            # React components
│   │   ├── common/            # Shared components
│   │   ├── product/           # Product-related components
│   │   └── cart/              # Cart components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useFetchProducts.ts
│   │   ├── useProductDetails.ts
│   │   ├── useCart.ts
│   │   └── useForm.ts
│   ├── store/                 # Redux store
│   │   ├── index.ts
│   │   ├── cartSlice.ts
│   │   └── hooks.ts
│   ├── services/              # API services
│   │   └── api.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   └── providers/             # React context providers
├── public/                    # Static assets
├── .github/workflows/         # CI/CD workflows
└── tests/                     # Test files
```

## ⚙️ **Technical Implementation**

### 🔄 **State Management Integration**

**Redux Toolkit + React Query Architecture:**

```typescript
// Cart State (Client) - Redux Toolkit
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: { addToCart, removeFromCart, updateQuantity },
});

// Server State - React Query
const { data: products } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 🛡️ **Zod Validation Integration**

**Type-safe Form Validation:**

```typescript
// Validation Schema
const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name required'),
  address: z.string().min(5, 'Address too short'),
});

// Custom Hook Integration
const { values, errors, isValid } = useForm(checkoutSchema);
```

### ⚡ **Debounced Search Implementation**

**Performance-Optimized Search:**

```typescript
// Custom useDebounce Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage in Search Component
const searchTerm = useDebounce(inputValue, 300);
const { data: searchResults } = useQuery({
  queryKey: ['search', searchTerm],
  queryFn: () => searchProducts(searchTerm),
  enabled: searchTerm.length > 2,
});
```

### 🎣 **Custom Hooks Architecture**

**Reusable Business Logic:**

```typescript
// useCart - Cart Management
const useCart = () => ({
  items: useAppSelector(selectCartItems),
  addItem: (product) => dispatch(addToCart(product)),
  total: useAppSelector(selectCartTotal),
});

// useFetchProducts - Product Data
const useFetchProducts = (filters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    select: (data) => normalizeProducts(data),
  });

// useForm - Form State & Validation
const useForm = (schema) => ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  isValid,
});
```

## 🚀 **Getting Started**

### Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nextshop.git
   cd nextshop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run validate     # Run Zod schema validation checks

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run end-to-end tests

# Quality Assurance
npm run pre-commit   # Run all quality checks
npm run validate-schemas # Validate all Zod schemas

# Deployment
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

## 🔧 **Configuration**

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://dummyjson.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Next.js Configuration

The application uses the latest Next.js App Router with the following optimizations:

- **Turbopack** for fast development builds
- **Image Optimization** with automatic WebP conversion
- **Bundle Analysis** for performance monitoring
- **Static Generation** for product pages

## 🧪 **Testing**

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests** - Component and utility testing
- **Integration Tests** - Hook and store testing
- **E2E Tests** - Critical user journey testing

### Coverage Requirements

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

## 🚢 **Deployment**

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** automatically on every push to main

### Docker

```bash
# Build the image
docker build -t nextshop .

# Run the container
docker run -p 3000:3000 nextshop
```

### Self-hosted

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📊 **Performance**

### Lighthouse Scores (Target)

- **Performance:** ≥ 80
- **Accessibility:** ≥ 90
- **Best Practices:** ≥ 90
- **SEO:** ≥ 90

### Optimizations

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Webpack Bundle Analyzer
- **Caching** - React Query and browser caching
- **Compression** - Gzip and Brotli compression

## 🔒 **Security**

### Security Measures

- **Content Security Policy (CSP)** - XSS protection
- **HTTPS Enforcement** - Secure data transmission
- **Input Validation** - Form validation and sanitization
- **Dependency Scanning** - Automated vulnerability checks
- **Error Boundaries** - Graceful error handling

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint** - Code linting with custom rules
- **Prettier** - Code formatting consistency
- **TypeScript** - Static type checking
- **Zod** - Runtime validation and type inference
- **Conventional Commits** - Semantic commit messages
- **Husky** - Git hooks for quality gates

### Quality Assurance

**Pre-commit Checks:**

```bash
# Automated quality gates
- TypeScript compilation ✓
- ESLint code quality ✓
- Prettier formatting ✓
- Zod schema validation ✓
- Unit test coverage ✓
- Build success verification ✓
```

**Integration Testing:**

- Redux state management testing
- React Query hook testing
- Form validation with Zod schemas
- Custom hooks integration testing
- Component interaction testing

## 📈 **Monitoring & Analytics**

### Performance Monitoring

- **Web Vitals** - Core performance metrics
- **Lighthouse CI** - Automated performance testing
- **Bundle Analysis** - Bundle size monitoring

### Error Tracking

- **Error Boundaries** - React error handling
- **Console Monitoring** - Development error tracking
- **User Feedback** - Error reporting system

## 📚 **API Documentation**

The application uses the [DummyJSON API](https://dummyjson.com) for product data.

### Key Endpoints

```typescript
// Products
GET / products; // Get all products
GET / products / { id }; // Get product by ID
GET / products / search; // Search products
GET / products / categories; // Get categories

// Example Usage
const products = await fetch('https://dummyjson.com/products?limit=20&skip=0');
```

## 🗺️ **Roadmap**

### Completed ✅

- [x] Product catalog with SSR
- [x] Shopping cart functionality with Redux Toolkit
- [x] Checkout flow with Zod validation
- [x] Debounced search and filtering
- [x] React Query integration for server state
- [x] Custom hooks architecture (useCart, useForm, useFetchProducts)
- [x] Redux persistence and cross-tab synchronization
- [x] Responsive design with Bootstrap 5
- [x] Testing setup with Jest and RTL
- [x] CI/CD pipeline with GitHub Actions

### In Progress 🚧

- [ ] Error boundaries implementation
- [ ] React.memo performance optimizations
- [ ] Service worker for PWA features
- [ ] User authentication with validation
- [ ] Product reviews with Zod schemas

### Planned 📋

- [ ] PWA features
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode theme

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Lead Developer** - [Your Name](https://github.com/yourusername)
- **UI/UX Designer** - [Designer Name](https://github.com/designer)
- **DevOps Engineer** - [DevOps Name](https://github.com/devops)

## 🙏 **Acknowledgments**

- [Next.js Team](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for seamless deployment
- [DummyJSON](https://dummyjson.com/) for the API
- [Bootstrap Team](https://getbootstrap.com/) for the UI components

## 📞 **Support**

- **Documentation** - [Wiki](https://github.com/yourusername/nextshop/wiki)
- **Issues** - [GitHub Issues](https://github.com/yourusername/nextshop/issues)
- **Discussions** - [GitHub Discussions](https://github.com/yourusername/nextshop/discussions)
- **Email** - support@nextshop.com

---

**Built with ❤️ using Next.js and modern web technologies**
