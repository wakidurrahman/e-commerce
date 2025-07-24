import { productApi } from '@/services/api';
import { Category } from '@/types';
import Link from 'next/link';
// Import individual components to avoid React 19 compatibility issues
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// Error component for server-side errors
export function CategoriesError({ error }: { error: string }) {
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

// 🖥️ Pure SSR Component - Server waits for all data before sending HTML
export default async function CategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    // Server-side data fetching - blocks until complete
    categories = await productApi.getCategories();
    console.log(`✅ SSR: Fetched ${categories.length} categories`);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load categories';
    console.error('❌ SSR Categories Error:', err);
  }

  // Handle error state
  if (error) {
    return <CategoriesError error={error} />;
  }

  return (
    <Container className="py-4">
      {/* Global CSS for hover effects - SSR compatible */}

      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Product Categories</h1>
        <p className="lead text-muted">
          Explore our wide range of product categories ({categories.length}{' '}
          categories available)
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <Row>
          {categories.map((category) => (
            <Col key={category.slug} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100 category-card-hover">
                <CardBody className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-grid-3x3-gap-fill text-primary"
                      style={{ fontSize: '3rem' }}
                    ></i>
                  </div>
                  <CardTitle className="h5 mb-2">{category.name}</CardTitle>
                  <CardText className="text-muted small mb-3">
                    Browse all {category.name.toLowerCase()} products
                  </CardText>
                  <Link
                    href={`/?category=${category.slug}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Products
                  </Link>
                </CardBody>
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
    </Container>
  );
}

// 📊 SEO Metadata for better search engine optimization
export const metadata = {
  title: 'Product Categories - NextShop',
  description:
    'Browse all product categories and find exactly what you are looking for. Explore our wide range of product categories.',
  keywords: 'categories, products, shopping, browse, e-commerce',
  openGraph: {
    title: 'Product Categories - NextShop',
    description:
      'Browse all product categories and find exactly what you are looking for',
    type: 'website',
    siteName: 'NextShop',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 🔄 ISR for performance - revalidate every 10 minutes
export const revalidate = 600;
