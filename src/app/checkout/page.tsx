'use client';

import { useCart } from '@/hooks/useCart';
import { CheckoutFormData, checkoutFormSchema } from '@/schemas/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  ProgressBar,
  Row,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

// Using CheckoutFormData from schemas/validation.ts

const initialFormData: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  paymentMethod: 'credit',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: '',
  sameAsBilling: true,
};

const checkoutSteps = [
  { id: 1, title: 'Cart Review', description: 'Review your items' },
  { id: 2, title: 'Shipping', description: 'Shipping information' },
  { id: 3, title: 'Payment', description: 'Payment details' },
  { id: 4, title: 'Confirmation', description: 'Order confirmation' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [showBackModal, setShowBackModal] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice >= 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + shippingCost + tax;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Redirect to cart if empty
  useEffect(() => {
    if (totalItems === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [totalItems, orderPlaced, router]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return totalItems > 0;
      case 2:
        return [
          'firstName',
          'lastName',
          'email',
          'phone',
          'address',
          'city',
          'state',
          'zipCode',
        ].every((field) => {
          const fieldKey = field as keyof CheckoutFormData;
          return watchedValues[fieldKey] && !errors[fieldKey];
        });
      case 3:
        return ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'].every(
          (field) => {
            const fieldKey = field as keyof CheckoutFormData;
            return watchedValues[fieldKey] && !errors[fieldKey];
          }
        );
      default:
        return true;
    }
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!cart?.items?.length) return;

    setIsSubmitting(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newOrderId = uuidv4().slice(0, 8).toUpperCase();
      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
      setCurrentStep(4);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\s/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setValue('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setValue('expiryDate', value);
  };

  const handleNextStep = async () => {
    if (currentStep < 4) {
      // Only validate form fields for steps that have forms (steps 2 & 3)
      if (currentStep > 1) {
        const isStepValid = await trigger();
        if (!isStepValid) return;
      }

      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <Card.Header>
              <h5>Review Your Order</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {cart.items.map((item) => {
                  const discountedPrice =
                    item.product.price *
                    (1 - item.product.discountPercentage / 100);
                  const itemTotal = discountedPrice * item.quantity;

                  return (
                    <ListGroup.Item
                      key={item.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          width="60"
                          height="60"
                          className="rounded me-3"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-1">{item.product.title}</h6>
                          <small className="text-muted">
                            ${discountedPrice.toFixed(2)} × {item.quantity}
                          </small>
                          {item.product.discountPercentage > 0 && (
                            <Badge bg="danger" className="ms-2">
                              -{Math.round(item.product.discountPercentage)}%
                              OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="fw-semibold">
                        ${itemTotal.toFixed(2)}
                      </span>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card>
            <Card.Header>
              <h5>Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        {...register('firstName')}
                        type="text"
                        isInvalid={!!errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        {...register('lastName')}
                        type="text"
                        isInvalid={!!errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        {...register('email')}
                        type="email"
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        {...register('phone')}
                        type="tel"
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    {...register('address')}
                    type="text"
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        {...register('city')}
                        type="text"
                        isInvalid={!!errors.city}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        {...register('state')}
                        type="text"
                        isInvalid={!!errors.state}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.state?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code *</Form.Label>
                      <Form.Control
                        {...register('zipCode')}
                        type="text"
                        isInvalid={!!errors.zipCode}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.zipCode?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card>
            <Card.Header>
              <h5>Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      id="credit"
                      label="Credit Card"
                      name="paymentMethod"
                      value="credit"
                      checked={watchedValues.paymentMethod === 'credit'}
                      onChange={(e) =>
                        setValue('paymentMethod', e.target.value as 'credit')
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="debit"
                      label="Debit Card"
                      name="paymentMethod"
                      value="debit"
                      checked={watchedValues.paymentMethod === 'debit'}
                      onChange={(e) =>
                        setValue('paymentMethod', e.target.value as 'debit')
                      }
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Card Number *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={watchedValues.cardNumber}
                    onChange={handleCardNumberChange}
                    isInvalid={!!errors.cardNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cardNumber?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiry Date *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="MM/YY"
                        value={watchedValues.expiryDate}
                        onChange={handleExpiryChange}
                        isInvalid={!!errors.expiryDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.expiryDate?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV *</Form.Label>
                      <Form.Control
                        {...register('cvv')}
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        isInvalid={!!errors.cvv}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cvv?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Cardholder Name *</Form.Label>
                  <Form.Control
                    {...register('cardholderName')}
                    type="text"
                    isInvalid={!!errors.cardholderName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cardholderName?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Alert variant="info">
                  <i className="bi bi-shield-check me-2"></i>
                  Your payment information is encrypted and secure.
                </Alert>
              </Form>
            </Card.Body>
          </Card>
        );

      case 4:
        return (
          <div className="text-center py-5">
            <i
              className="bi bi-check-circle-fill text-success"
              style={{ fontSize: '5rem' }}
            ></i>
            <h2 className="mt-4 mb-3">Order Confirmed!</h2>
            <p className="text-muted mb-4">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>

            <Card className="mx-auto" style={{ maxWidth: '400px' }}>
              <Card.Body>
                <h5>Order Details</h5>
                <p>
                  <strong>Order ID:</strong> {orderId}
                </p>
                <p>
                  <strong>Total:</strong> ${finalTotal.toFixed(2)}
                </p>
                <p>
                  <strong>Items:</strong> {totalItems}
                </p>
                <hr />
                <p className="small text-muted">
                  A confirmation email has been sent to {watchedValues.email}
                </p>
              </Card.Body>
            </Card>

            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => router.push('/')}
                className="me-3"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => router.push('/orders')}
              >
                View Orders
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (totalItems === 0 && !orderPlaced) {
    return null; // Will redirect to cart
  }

  return (
    <Container className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/cart">Cart</Breadcrumb.Item>
        <Breadcrumb.Item active>Checkout</Breadcrumb.Item>
      </Breadcrumb>

      {/* Progress Steps */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            {checkoutSteps.map((step, index) => (
              <div key={step.id} className="text-center flex-fill">
                <div
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                    currentStep >= step.id
                      ? 'bg-primary text-white'
                      : 'bg-light text-muted'
                  }`}
                  style={{ width: '40px', height: '40px' }}
                >
                  {currentStep > step.id ? (
                    <i className="bi bi-check"></i>
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <small className="fw-semibold">{step.title}</small>
                  <div className="small text-muted">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <ProgressBar
            now={((currentStep - 1) / (checkoutSteps.length - 1)) * 100}
            className="mb-0"
          />
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8}>{renderStepContent()}</Col>

        {currentStep < 4 && (
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
                    {shippingCost === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-3">
                  <span className="h5">Total</span>
                  <span className="h5 text-success">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="d-grid gap-2">
                  {currentStep === 3 ? (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleFormSubmit}
                      disabled={!validateStep(currentStep) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleNextStep}
                      disabled={!validateStep(currentStep)}
                    >
                      Continue
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button
                      variant="outline-secondary"
                      onClick={handlePrevStep}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                  )}
                </div>

                <div className="text-center mt-3 text-muted small">
                  <i className="bi bi-shield-check me-1"></i>
                  Secure checkout protected by SSL
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Back to Cart Modal */}
      <Modal show={showBackModal} onHide={() => setShowBackModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Leave Checkout?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to go back to your cart? Your progress will be
          saved.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackModal(false)}>
            Stay
          </Button>
          <Button variant="primary" onClick={() => router.push('/cart')}>
            Go to Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
