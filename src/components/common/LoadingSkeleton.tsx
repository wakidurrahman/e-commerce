import { Card, Col, Placeholder, Row } from 'react-bootstrap';

interface LoadingSkeletonProps {
  variant?: 'product' | 'productDetails' | 'text' | 'card';
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = 'product',
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const renderProductSkeleton = () => (
    <Card className={`h-100 ${className}`}>
      <Placeholder as={Card.Img} variant="top" style={{ height: '250px' }} />
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder xs={6} /> <Placeholder xs={8} />
          <Placeholder xs={5} /> <Placeholder xs={7} />
        </Placeholder>
        <div className="d-flex justify-content-between align-items-center">
          <Placeholder.Button variant="primary" xs={4} />
          <Placeholder xs={3} />
        </div>
      </Card.Body>
    </Card>
  );

  const renderProductDetailsSkeleton = () => (
    <Row className={className}>
      <Col md={6}>
        <Placeholder style={{ width: '100%', height: '400px' }} />
        <Row className="mt-3">
          {[...Array(4)].map((_, i) => (
            <Col xs={3} key={i}>
              <Placeholder style={{ width: '100%', height: '80px' }} />
            </Col>
          ))}
        </Row>
      </Col>
      <Col md={6}>
        <Placeholder as="h1" animation="glow">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={4} size="lg" />
        </Placeholder>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={6} /> <Placeholder xs={8} />
          <Placeholder xs={7} /> <Placeholder xs={5} />
          <Placeholder xs={9} /> <Placeholder xs={4} />
        </Placeholder>
        <div className="mb-3">
          <Placeholder.Button variant="success" size="lg" xs={6} />
        </div>
        <div className="border-top pt-3">
          <Placeholder as="h6" animation="glow">
            <Placeholder xs={4} />
          </Placeholder>
          <Placeholder as="p" animation="glow">
            <Placeholder xs={8} />
          </Placeholder>
        </div>
      </Col>
    </Row>
  );

  const renderTextSkeleton = () => (
    <div className={className}>
      <Placeholder as="p" animation="glow">
        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />
        <Placeholder xs={6} /> <Placeholder xs={8} />
      </Placeholder>
    </div>
  );

  const renderCardSkeleton = () => (
    <Card className={className}>
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder xs={7} /> <Placeholder xs={4} />
          <Placeholder xs={4} /> <Placeholder xs={6} />
        </Placeholder>
        <Placeholder.Button variant="primary" xs={3} />
      </Card.Body>
    </Card>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'product':
        return renderProductSkeleton();
      case 'productDetails':
        return renderProductDetailsSkeleton();
      case 'text':
        return renderTextSkeleton();
      case 'card':
        return renderCardSkeleton();
      default:
        return renderProductSkeleton();
    }
  };

  if (variant === 'productDetails') {
    return renderSkeleton();
  }

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

// Specific skeleton components for common use cases
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Row>
      {[...Array(count)].map((_, index) => (
        <Col key={index} sm={6} md={4} lg={3} className="mb-4">
          <LoadingSkeleton variant="product" />
        </Col>
      ))}
    </Row>
  );
}

export function ProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="mb-3">
          <LoadingSkeleton variant="card" />
        </div>
      ))}
    </>
  );
}
