import { productApi } from '@/services/api';
import { Category } from '@/types';
import Link from 'next/link';
import { Suspense } from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';

// Loading component for Suspense boundary
function CategoriesLoading() {
  return (
    <Container className="py-4">
      <h1 className="mb-4">Categories</h1>
      <Row>
        {[...Array(8)].map((_, index) => (
          <Col key={index} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="placeholder-glow">
                  <div
                    className="placeholder rounded-circle bg-secondary"
                    style={{ width: '3rem', height: '3rem' }}
                  ></div>
                </div>
                <div className="placeholder-glow mt-3 w-100">
                  <div
                    className="placeholder bg-secondary"
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <div className="placeholder-glow mt-2 w-100">
                  <div
                    className="placeholder bg-secondary"
                    style={{ width: '80%' }}
                  ></div>
                </div>
                <div className="placeholder-glow mt-3">
                  <div
                    className="placeholder bg-primary rounded"
                    style={{ width: '100px', height: '32px' }}
                  ></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

// Error component
function CategoriesError({ error }: { error: string }) {
  return (
    <Container className="py-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Categories</Alert.Heading>
        <p>{error}</p>
        <p className="text-muted small">
          Please refresh the page or try again later.
        </p>
      </Alert>
    </Container>
  );
}

// Server Component - This runs on the server for each request (SSR)
async function CategoriesContent() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    // Using existing API function - this runs on the server
    categories = await productApi.getCategories();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load categories';
    console.error('Categories SSR Error:', err);
  }

  // Handle error state
  if (error) {
    return <CategoriesError error={error} />;
  }

  return (
    <Container className="py-4">
      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Product Categories</h1>
        <p className="lead text-muted">
          Explore our wide range of product categories
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <Row>
          {categories.map((category) => (
            <Col key={category.slug} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100 category-card">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-grid-3x3-gap-fill text-primary"
                      style={{ fontSize: '3rem' }}
                    ></i>
                  </div>
                  <Card.Title className="h5 mb-2">{category.name}</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    Browse all {category.name.toLowerCase()} products
                  </Card.Text>
                  <Link
                    href={`/?category=${category.slug}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Products
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <i
            className="bi bi-grid-3x3-gap"
            style={{ fontSize: '4rem', color: '#6c757d' }}
          ></i>
          <h3 className="mt-3 text-muted">No categories found</h3>
          <p className="text-muted">
            Categories are currently unavailable. Please try again later.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="text-center mt-5 pt-4 border-top">
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="/" className="btn btn-outline-primary">
            <i className="bi bi-house me-2"></i>
            Back to Home
          </Link>
          <Link href="/" className="btn btn-primary">
            <i className="bi bi-grid me-2"></i>
            View All Products
          </Link>
        </div>
      </div>

      <style jsx>{`
        .category-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border: 1px solid #dee2e6;
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Container>
  );
}

// Main page component with Suspense for loading state
export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent />
    </Suspense>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Product Categories - NextShop',
  description:
    'Browse all product categories and find exactly what you are looking for',
  keywords: 'categories, products, shopping, browse',
};
