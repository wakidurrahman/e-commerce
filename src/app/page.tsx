'use client';

import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton';
import ProductCard from '@/components/product/ProductCard';
import { useFetchCategories, useFetchProducts } from '@/hooks/useFetchProducts';
import { PaginationParams } from '@/types';
import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';

export default function HomePage() {
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'title',
    order: 'asc',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch products with current filters
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useFetchProducts({
    params: {
      ...filters,
      category: selectedCategory || undefined,
    },
  });

  // Fetch categories for filter dropdown
  const { data: categories = [], isLoading: categoriesLoading } =
    useFetchCategories();

  const handleSortChange = (sortBy: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, order, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  return (
    <Container>
      {/* Hero Section */}
      <div className="text-center py-5 mb-5 bg-primary text-white rounded">
        <h1 className="display-4 fw-bold">Welcome to NextShop</h1>
        <p className="lead">Discover amazing products at unbeatable prices</p>
        <Button variant="light" size="lg" href="/products">
          Shop Now
        </Button>
      </div>

      {/* Filters and Sorting */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="d-flex gap-3 align-items-center">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={categoriesLoading}
              style={{ maxWidth: '200px' }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </Form.Select>
          </div>
        </Col>

        <Col md={6}>
          <div className="d-flex gap-2 justify-content-md-end">
            <Form.Select
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split('-') as [
                  string,
                  'asc' | 'desc'
                ];
                handleSortChange(sortBy, order);
              }}
              style={{ maxWidth: '200px' }}
            >
              <option value="title-asc">Name: A to Z</option>
              <option value="title-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Error Display */}
      {productsError && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Products</Alert.Heading>
          <p>{productsError}</p>
          <Button variant="outline-danger" onClick={() => refetchProducts()}>
            Try Again
          </Button>
        </Alert>
      )}

      {/* Products Grid */}
      {productsLoading ? (
        <ProductGridSkeleton count={20} />
      ) : products.length > 0 ? (
        <>
          <Row>
            {products.map((product) => (
              <Col key={product.id} sm={6} md={4} lg={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Load More Button */}
          {products.length >= (filters.limit || 20) && (
            <div className="text-center mt-4 mb-5">
              <Button
                variant="primary"
                size="lg"
                onClick={handleLoadMore}
                disabled={productsLoading}
              >
                {productsLoading ? 'Loading...' : 'Load More Products'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <i
            className="bi bi-search"
            style={{ fontSize: '4rem', color: '#6c757d' }}
          ></i>
          <h3 className="mt-3 text-muted">No products found</h3>
          <p className="text-muted">
            {selectedCategory
              ? `No products found in "${selectedCategory}" category`
              : 'Try adjusting your filters or search terms'}
          </p>
          {selectedCategory && (
            <Button variant="primary" onClick={() => handleCategoryChange('')}>
              View All Products
            </Button>
          )}
        </div>
      )}

      {/* Featured Categories Section */}
      {!categoriesLoading && categories.length > 0 && (
        <div className="mt-5 pt-5 border-top">
          <h2 className="text-center mb-4">Shop by Category</h2>
          <Row>
            {categories.slice(0, 6).map((category) => (
              <Col key={category} md={4} lg={2} className="mb-3">
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
}
