'use client';

import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton';
import ProductCard from '@/components/product/ProductCard';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import {
  useFetchCategories,
  useSearchProducts,
} from '@/hooks/useFetchProducts';
import { selectCartTotalItems } from '@/store/cartSlice';
import { useAppSelector } from '@/store/hooks';
import { PaginationParams } from '@/types';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';

// Search filters component
function SearchFilters({
  filters,
  onFiltersChange,
  categories,
  categoriesLoading,
}: {
  filters: PaginationParams;
  onFiltersChange: (newFilters: Partial<PaginationParams>) => void;
  categories: string[];
  categoriesLoading: boolean;
}) {
  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filter Results
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          {/* Category Filter */}
          <Col md={6} className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={filters.category || ''}
              onChange={(e) =>
                onFiltersChange({ category: e.target.value || undefined })
              }
              disabled={categoriesLoading}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* Sort By */}
          <Col md={6} className="mb-3">
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split('-') as [
                  string,
                  'asc' | 'desc'
                ];
                onFiltersChange({ sortBy, order });
              }}
            >
              <option value="title-asc">Name: A to Z</option>
              <option value="title-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Price Range Filter */}
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label>Min Price ($)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              onChange={(e) => {
                const value = e.target.value
                  ? parseFloat(e.target.value)
                  : undefined;
                onFiltersChange({ minPrice: value });
              }}
            />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label>Max Price ($)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              placeholder="1000.00"
              onChange={(e) => {
                const value = e.target.value
                  ? parseFloat(e.target.value)
                  : undefined;
                onFiltersChange({ maxPrice: value });
              }}
            />
          </Col>
        </Row>

        {/* Clear Filters */}
        <div className="d-flex justify-content-end">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              onFiltersChange({
                category: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sortBy: 'title',
                order: 'asc',
              })
            }
          >
            Clear Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

// Main search content component
function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // Redux state - demonstrating proper integration
  const cartItemsCount = useAppSelector(selectCartTotalItems);

  // Debounced search hook
  const { searchValue, debouncedSearchValue, setSearchValue } =
    useDebouncedSearch(initialQuery, 300);

  // Local state for filters
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'title',
    order: 'asc',
  });

  // React Query hooks - proper integration with custom hooks
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchProducts(
    debouncedSearchValue,
    filters,
    debouncedSearchValue.length > 0
  );

  const { data: categories = [], isLoading: categoriesLoading } =
    useFetchCategories();

  // Update search value when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchValue) {
      setSearchValue(queryParam);
    }
  }, [searchParams, searchValue, setSearchValue]);

  // Reset page when filters change
  const handleFiltersChange = (newFilters: Partial<PaginationParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Load more functionality
  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const products = searchResults?.products || [];
  const totalResults = searchResults?.total || 0;
  const hasResults = products.length > 0;
  const showLoadMore = hasResults && products.length < totalResults;

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>
          Search Results{' '}
          {debouncedSearchValue && <>for &quot;{debouncedSearchValue}&quot;</>}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Search Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            Search Results
            {debouncedSearchValue && (
              <span className="text-muted">
                {' '}
                for &quot;{debouncedSearchValue}&quot;
              </span>
            )}
          </h1>
          {!searchLoading && totalResults > 0 && (
            <p className="text-muted mb-0">
              Found {totalResults.toLocaleString()} result
              {totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Cart indicator - Redux integration example */}
        {cartItemsCount > 0 && (
          <Badge bg="primary" className="fs-6">
            {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} in cart
          </Badge>
        )}
      </div>

      <Row>
        {/* Filters Sidebar */}
        <Col lg={3}>
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        </Col>

        {/* Results Area */}
        <Col lg={9}>
          {/* Loading State */}
          {searchLoading && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Searching...</span>
              </div>
              <ProductGridSkeleton count={12} />
            </div>
          )}

          {/* Error State */}
          {searchError && (
            <Alert variant="danger">
              <Alert.Heading>Search Error</Alert.Heading>
              <p>
                {typeof searchError === 'string'
                  ? searchError
                  : 'An error occurred while searching'}
              </p>
              <Button variant="outline-danger" onClick={() => refetchSearch()}>
                Try Again
              </Button>
            </Alert>
          )}

          {/* No Results */}
          {!searchLoading &&
            !searchError &&
            !hasResults &&
            debouncedSearchValue && (
              <div className="text-center py-5">
                <i
                  className="bi bi-search"
                  style={{ fontSize: '4rem', color: '#6c757d' }}
                ></i>
                <h3 className="mt-3 text-muted">No Results Found</h3>
                <p className="text-muted">
                  No products found for &quot;{debouncedSearchValue}&quot;. Try
                  adjusting your search terms or filters.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchValue('');
                    handleFiltersChange({
                      category: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                    });
                  }}
                >
                  Clear Search
                </Button>
              </div>
            )}

          {/* Empty State - No Search Query */}
          {!searchLoading && !debouncedSearchValue && (
            <div className="text-center py-5">
              <i
                className="bi bi-search"
                style={{ fontSize: '4rem', color: '#6c757d' }}
              ></i>
              <h3 className="mt-3 text-muted">Start Your Search</h3>
              <p className="text-muted">
                Enter a search term to find products, or browse by category.
              </p>
            </div>
          )}

          {/* Results Grid */}
          {hasResults && !searchLoading && (
            <>
              <Row>
                {products.map((product) => (
                  <Col key={product.id} sm={6} md={4} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* Load More Button */}
              {showLoadMore && (
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Loading...
                      </>
                    ) : (
                      `Load More Products (${
                        totalResults - products.length
                      } remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

// Main component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-4">
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        </Container>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
