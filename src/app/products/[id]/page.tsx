'use client';

import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { useCart } from '@/hooks/useCart';
import { useProductDetails } from '@/hooks/useProductDetails';
import { Review } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Carousel,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { product, isLoading, error, refetch } = useProductDetails({
    id: productId,
    enabled: !isNaN(productId),
  });

  const { addToCart, isProductInCart, getProductQuantity } = useCart();

  const isInCart = product ? isProductInCart(product.id) : false;
  const cartQuantity = product ? getProductQuantity(product.id) : 0;

  const handleAddToCart = async () => {
    if (!product || !inStock) return;

    setAddToCartLoading(true);
    try {
      addToCart(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddToCartLoading(false);
    }
  };

  if (isNaN(productId)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Invalid Product</Alert.Heading>
          <p>The product ID provided is not valid.</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-4">
        <LoadingSkeleton variant="productDetails" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>
            {error || 'The product you are looking for could not be found.'}
          </p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => refetch()}>
              Try Again
            </Button>
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);
  const inStock =
    product.availabilityStatus === 'In Stock' && product.stock > 0;
  const maxQuantity = Math.min(product.stock, 10); // Limit to max 10 items

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
      );
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
        <Breadcrumb.Item href={`/products/category/${product.category}`}>
          {product.category}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Product Images */}
        <Col lg={6}>
          <div className="mb-4">
            {product.images && product.images.length > 1 ? (
              <Carousel
                activeIndex={selectedImageIndex}
                onSelect={(selectedIndex) =>
                  setSelectedImageIndex(selectedIndex)
                }
                interval={null}
              >
                {product.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <div style={{ height: '500px', position: 'relative' }}>
                      <Image
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                      />
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div style={{ height: '500px', position: 'relative' }}>
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded"
                />
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <Row>
              {product.images.slice(0, 4).map((image, index) => (
                <Col key={index} xs={3}>
                  <div
                    style={{
                      height: '80px',
                      position: 'relative',
                      cursor: 'pointer',
                      border:
                        selectedImageIndex === index
                          ? '2px solid #007bff'
                          : '1px solid #dee2e6',
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Product Details */}
        <Col lg={6}>
          <div className="mb-3">
            <h1 className="mb-2">{product.title}</h1>
            {product.brand && (
              <p className="text-muted mb-2">
                Brand: <span className="fw-semibold">{product.brand}</span>
              </p>
            )}

            {/* Rating */}
            <div className="d-flex align-items-center mb-3">
              <div className="me-2">{renderStars(product.rating)}</div>
              <span className="me-3">
                {product.rating.toFixed(1)} ({product.reviews?.length || 0}{' '}
                reviews)
              </span>
              {product.reviews && product.reviews.length > 0 && (
                <Link href="#reviews" className="text-decoration-none">
                  See all reviews
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-3">
                <h2 className="text-success mb-0">
                  ${discountedPrice.toFixed(2)}
                </h2>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-muted text-decoration-line-through h4">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge bg="danger" className="h6">
                      -{Math.round(product.discountPercentage)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              {inStock ? (
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="text-success">
                    In Stock ({product.stock} available)
                  </span>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <i className="bi bi-x-circle-fill text-danger me-2"></i>
                  <span className="text-danger">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <Alert variant="success" className="mb-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                Product added to cart successfully!
              </Alert>
            )}

            {/* Add to Cart Section */}
            {inStock && (
              <div className="mb-4">
                <Row className="align-items-end">
                  <Col xs={4}>
                    <Form.Label htmlFor="quantity">Quantity</Form.Label>
                    <Form.Select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                    >
                      {[...Array(maxQuantity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col xs={8}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100"
                      onClick={handleAddToCart}
                      disabled={addToCartLoading}
                    >
                      {addToCartLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding to Cart...
                        </>
                      ) : isInCart ? (
                        `Add More (${cartQuantity} in cart)`
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </Col>
                </Row>
              </div>
            )}

            {/* Product Info Cards */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title className="h6">
                      <i className="bi bi-truck me-2"></i>
                      Shipping
                    </Card.Title>
                    <Card.Text className="small">
                      {product.shippingInformation}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title className="h6">
                      <i className="bi bi-arrow-return-left me-2"></i>
                      Returns
                    </Card.Title>
                    <Card.Text className="small">
                      {product.returnPolicy}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="description" className="mb-3">
            <Tab eventKey="description" title="Description">
              <div className="py-3">
                <p>{product.description}</p>

                {/* Product Specifications */}
                <h5 className="mt-4 mb-3">Specifications</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>SKU:</span>
                    <span>{product.sku}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Category:</span>
                    <span>{product.category}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Weight:</span>
                    <span>{product.weight}g</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Dimensions:</span>
                    <span>
                      {product.dimensions.width}&quot; ×{' '}
                      {product.dimensions.height}&quot; ×{' '}
                      {product.dimensions.depth}&quot;
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Warranty:</span>
                    <span>{product.warrantyInformation}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Minimum Order:</span>
                    <span>{product.minimumOrderQuantity}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Tab>

            <Tab
              eventKey="reviews"
              title={`Reviews (${product.reviews?.length || 0})`}
              tabClassName="text-decoration-none"
            >
              <div className="py-3" id="reviews">
                {product.reviews && product.reviews.length > 0 ? (
                  <div>
                    {product.reviews.map((review: Review, index: number) => (
                      <Card key={index} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{review.reviewerName}</h6>
                              <div className="d-flex align-items-center">
                                {renderStars(review.rating)}
                                <span className="ms-2 small text-muted">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <small className="text-muted">
                              {formatDate(review.date)}
                            </small>
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i
                      className="bi bi-chat-dots"
                      style={{ fontSize: '3rem' }}
                    ></i>
                    <h5 className="mt-3">No reviews yet</h5>
                    <p>Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
