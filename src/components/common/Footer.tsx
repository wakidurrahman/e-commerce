import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>NextShop</h5>
            <p className="text-white">
              Your one-stop destination for quality products at great prices.
              Discover amazing deals and fast shipping on thousands of items.
            </p>
          </Col>

          <Col md={2} className="mb-3">
            <h6>Shop</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  href="/products"
                  className="text-white text-decoration-none"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-white text-decoration-none"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-white text-decoration-none">
                  Deals
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-3">
            <h6>Customer Service</h6>
            <ul className="list-unstyled">
              <li>
                <Link href="/help" className="text-white text-decoration-none">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-white text-decoration-none"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-white text-decoration-none"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white text-decoration-none"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-3">
            <h6>Account</h6>
            <ul className="list-unstyled">
              <li>
                <Link href="/login" className="text-white text-decoration-none">
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-white text-decoration-none"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-white text-decoration-none"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-white text-decoration-none"
                >
                  Order History
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-3">
            <h6>Company</h6>
            <ul className="list-unstyled">
              <li>
                <Link href="/about" className="text-white text-decoration-none">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-white text-decoration-none"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white text-decoration-none"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white text-decoration-none">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="border-secondary" />

        <Row className="align-items-center">
          <Col md={6}>
            <p className="mb-0 text-white">
              © {currentYear} NextShop. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="d-flex justify-content-md-end gap-3">
              <a href="#" className="text-white">
                <i
                  className="bi bi-facebook"
                  style={{ fontSize: '1.5rem' }}
                ></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-twitter" style={{ fontSize: '1.5rem' }}></i>
              </a>
              <a href="#" className="text-white">
                <i
                  className="bi bi-instagram"
                  style={{ fontSize: '1.5rem' }}
                ></i>
              </a>
              <a href="#" className="text-white">
                <i
                  className="bi bi-linkedin"
                  style={{ fontSize: '1.5rem' }}
                ></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
