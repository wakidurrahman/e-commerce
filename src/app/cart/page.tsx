'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [showClearModal, setShowClearModal] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const shippingThreshold = 50;
  const freeShipping = totalPrice >= shippingThreshold;
  const shippingCost = freeShipping ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      updateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const calculateItemTotal = (item: CartItem) => {
    const discountedPrice =
      item.product.price * (1 - item.product.discountPercentage / 100);
    return discountedPrice * item.quantity;
  };

  const renderCartItem = (item: CartItem) => {
    const discountedPrice =
      item.product.price * (1 - item.product.discountPercentage / 100);
    const itemTotal = calculateItemTotal(item);
    const isUpdating = updatingItems.has(item.id);
    const maxQuantity = Math.min(item.product.stock, 10);

    return (
      <tr key={item.id}>
        {/* Product Image & Info */}
        <td>
          <div className="d-flex align-items-center">
            <div
              style={{ width: '80px', height: '80px', position: 'relative' }}
              className="me-3"
            >
              <Image
                src={item.product.thumbnail}
                alt={item.product.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded"
              />
            </div>
            <div>
              <Link
                href={`/products/${item.product.id}`}
                className="text-decoration-none"
              >
                <h6 className="mb-1">{item.product.title}</h6>
              </Link>
              {item.product.brand && (
                <small className="text-muted">{item.product.brand}</small>
              )}
              <div className="mt-1">
                {item.product.discountPercentage > 0 && (
                  <Badge bg="danger" className="me-2">
                    -{Math.round(item.product.discountPercentage)}% OFF
                  </Badge>
                )}
                <small className="text-muted">SKU: {item.product.sku}</small>
              </div>
            </div>
          </div>
        </td>

        {/* Price */}
        <td>
          <div>
            <span className="fw-semibold text-success">
              ${discountedPrice.toFixed(2)}
            </span>
            {item.product.discountPercentage > 0 && (
              <div>
                <small className="text-muted text-decoration-line-through">
                  ${item.product.price.toFixed(2)}
                </small>
              </div>
            )}
          </div>
        </td>

        {/* Quantity */}
        <td>
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.id, parseInt(e.target.value))
              }
              disabled={isUpdating}
              style={{ width: '80px' }}
            >
              {[...Array(maxQuantity)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </Form.Select>
            {isUpdating && (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
          {item.product.stock <= 5 && (
            <small className="text-warning">
              Only {item.product.stock} left!
            </small>
          )}
        </td>

        {/* Total */}
        <td>
          <span className="fw-semibold">${itemTotal.toFixed(2)}</span>
        </td>

        {/* Actions */}
        <td>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRemoveItem(item.id)}
            title="Remove item"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </td>
      </tr>
    );
  };

  if (totalItems === 0) {
    return (
      <Container className="py-5">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item active>Shopping Cart</Breadcrumb.Item>
        </Breadcrumb>

        <div className="text-center py-5">
          <i
            className="bi bi-cart3"
            style={{ fontSize: '5rem', color: '#6c757d' }}
          ></i>
          <h2 className="mt-4 mb-3">Your cart is empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Shopping Cart</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                Shopping Cart ({totalItems}{' '}
                {totalItems === 1 ? 'item' : 'items'})
              </h4>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowClearModal(true)}
              >
                Clear Cart
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>{cart.items.map(renderCartItem)}</tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Link href="/" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </Link>
          </div>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>
                  {freeShipping ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              {!freeShipping && (
                <Alert variant="info" className="py-2 px-3 small">
                  <i className="bi bi-info-circle me-2"></i>
                  Add ${(shippingThreshold - totalPrice).toFixed(2)} more for
                  free shipping!
                </Alert>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <span className="h5">Total</span>
                <span className="h5 text-success">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              <div className="d-grid gap-2">
                <Link href="/checkout" className="btn btn-primary btn-lg">
                  Proceed to Checkout
                </Link>
                <Button variant="outline-secondary">Save for Later</Button>
              </div>

              {/* Security Badge */}
              <div className="text-center mt-3 text-muted small">
                <i className="bi bi-shield-check me-1"></i>
                Secure checkout with SSL encryption
              </div>
            </Card.Body>
          </Card>

          {/* Promotions */}
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Have a promo code?</h6>
            </Card.Header>
            <Card.Body>
              <Form>
                <div className="d-flex gap-2">
                  <Form.Control type="text" placeholder="Enter promo code" />
                  <Button variant="outline-primary">Apply</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Clear Cart Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove all items from your cart? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            Clear Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
