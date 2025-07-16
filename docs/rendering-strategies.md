# 🎨 Rendering Strategies

Quick guide for choosing the right rendering strategy for different e-commerce pages.

## 🔍 Strategy Overview

**Server-Side Rendering (SSR):**

- HTML generated on server
- Better SEO and initial load
- Higher server costs

**Client-Side Rendering (CSR):**

- HTML generated in browser
- Rich interactivity
- Slower initial load

**Incremental Static Regeneration (ISR):**

- Pre-generated with updates
- Best performance + fresh content
- Complex cache invalidation

## 📊 E-commerce Page Recommendations

| Page Type           | Strategy   | Reasoning                         |
| ------------------- | ---------- | --------------------------------- |
| **Homepage**        | SSR/ISR    | SEO critical, featured products   |
| **Product Listing** | SSR/ISR    | SEO important, browsable content  |
| **Product Details** | SSR/ISR    | SEO critical, shareable content   |
| **Shopping Cart**   | CSR        | Highly interactive, user-specific |
| **Checkout**        | SSR Hybrid | Security, form validation         |
| **User Dashboard**  | CSR        | Private, highly interactive       |
| **Search Results**  | SSR        | SEO for product discovery         |

## ⚡ Performance Comparison

```typescript
const PerformanceTargets = {
  SSR: {
    FCP: '800-1200ms', // First Contentful Paint
    LCP: '1200-2000ms', // Largest Contentful Paint
    TTI: '2000-3500ms', // Time to Interactive
  },
  CSR: {
    FCP: '1500-2500ms', // After JS loads
    LCP: '2000-3500ms', // After data fetching
    TTI: '2500-4000ms', // After full app loads
  },
  ISR: {
    FCP: '400-800ms', // Pre-rendered HTML
    LCP: '800-1500ms', // Optimized content
    TTI: '1500-2500ms', // Progressive enhancement
  },
};
```

## 🏗️ Implementation Examples

### SSR for Product Pages

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Server-side data fetching
  const product = await getProduct(params.id);

  return (
    <>
      <ProductDetails product={product} />
      {/* Client-side components load after */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>
    </>
  );
}

// SEO metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return {
    title: `${product.title} - ${product.brand}`,
    description: product.description,
    openGraph: {
      images: [product.thumbnail],
    },
  };
}
```

### CSR for Shopping Cart

```typescript
// app/cart/page.tsx
'use client';

export default function CartPage() {
  const cartItems = useAppSelector(selectCartItems);
  const [isClient, setIsClient] = useState(false);

  // Hydration guard
  useEffect(() => setIsClient(true), []);

  if (!isClient) return <CartSkeleton />;

  return (
    <div>
      {cartItems.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### ISR for Product Listings

```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductList initialProducts={products} />;
}

// ISR configuration
export const revalidate = 60; // Revalidate every minute
```

## 🎯 Decision Framework

### Choose SSR When:

- **SEO is critical** (product pages, categories)
- **Social sharing** important
- **Content changes frequently** but not real-time
- **First paint speed** matters most

### Choose CSR When:

- **Rich interactivity** required (cart, dashboard)
- **Real-time updates** needed
- **User-specific content** dominates
- **Server costs** need minimizing

### Choose ISR When:

- **Content changes occasionally** (product catalogs)
- **Need both performance and freshness**
- **Build times** would be too long for SSG
- **Can control cache invalidation**

## 🔧 Progressive Enhancement Pattern

```typescript
// Progressive enhancement for cart button
export default function ProductCard({ product }: { product: Product }) {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => setIsClient(true), []);

  return (
    <div className="product-card">
      <h3>{product.title}</h3>
      <p>${product.price}</p>

      {/* Progressive enhancement */}
      {isClient ? (
        <button onClick={() => dispatch(addToCart(product))}>
          Add to Cart
        </button>
      ) : (
        <form action="/api/cart/add" method="POST">
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit">Add to Cart</button>
        </form>
      )}
    </div>
  );
}
```

## 📋 Implementation Checklist

- [ ] **Strategy chosen** based on page type and requirements
- [ ] **SEO optimized** for public content pages
- [ ] **Loading states** implemented for all strategies
- [ ] **Progressive enhancement** for critical functionality
- [ ] **Hydration mismatches** identified and fixed
- [ ] **Performance targets** met for chosen strategy
- [ ] **Error boundaries** configured for client-side code
- [ ] **Accessibility** maintained across all strategies

## 🎯 Quick Reference

**For Demonstration Project:**

1. **Use SSR** for homepage and product pages (SEO showcase)
2. **Use CSR** for cart and checkout (interactivity showcase)
3. **Add ISR** to product listings (performance showcase)
4. **Implement progressive enhancement** where beneficial
5. **Monitor Core Web Vitals** to validate strategy choices

Focus on demonstrating the differences between strategies rather than optimizing for production scale.
