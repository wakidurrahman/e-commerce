'use client';

import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className = '',
}: ProductCardProps) {
  const { addToCart, isProductInCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);
  const inStock =
    product.availabilityStatus === 'In Stock' && product.stock > 0;
  const isInCart = isProductInCart(product.id);

  const handleAddToCart = async () => {
    if (!inStock) return;

    setAddToCartLoading(true);
    try {
      addToCart(product, 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddToCartLoading(false);
    }
  };

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

  return (
    <Card className={`h-100 product-card ${className}`}>
      {/* Product Image */}
      <div className="position-relative">
        <Link href={`/products/${product.id}`}>
          {!imageError ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              width={300}
              height={250}
              className="card-img-top"
              style={{
                objectFit: 'cover',
                height: '250px',
                cursor: 'pointer',
              }}
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div
              className="card-img-top d-flex align-items-center justify-content-center bg-light"
              style={{ height: '250px' }}
            >
              <i
                className="bi bi-image text-muted"
                style={{ fontSize: '3rem' }}
              ></i>
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
            -{Math.round(product.discountPercentage)}%
          </Badge>
        )}

        {/* Stock Status Badge */}
        {!inStock && (
          <Badge
            bg="secondary"
            className="position-absolute bottom-0 start-0 m-2"
          >
            Out of Stock
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Product Title */}
        <Link href={`/products/${product.id}`} className="text-decoration-none">
          <Card.Title className="mb-2 text-truncate" title={product.title}>
            {product.title}
          </Card.Title>
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="text-muted small mb-1">{product.brand}</p>
        )}

        {/* Rating */}
        <div className="mb-2">
          <div className="d-flex align-items-center">
            {renderStars(product.rating)}
            <span className="ms-2 small text-muted">
              ({product.rating.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="h5 text-success mb-0">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-muted text-decoration-line-through small">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert variant="success" className="py-1 px-2 small mb-2">
            Added to cart!
          </Alert>
        )}

        {/* Add to Cart Button */}
        <div className="mt-auto">
          <Button
            variant={isInCart ? 'outline-primary' : 'primary'}
            size="sm"
            className="w-100"
            onClick={handleAddToCart}
            disabled={!inStock || addToCartLoading}
          >
            {addToCartLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Adding...
              </>
            ) : isInCart ? (
              'Add More'
            ) : inStock ? (
              'Add to Cart'
            ) : (
              'Out of Stock'
            )}
          </Button>
        </div>

        {/* Stock Count */}
        {inStock && product.stock <= 10 && (
          <small className="text-warning mt-1">
            Only {product.stock} left!
          </small>
        )}
      </Card.Body>
    </Card>
  );
}
