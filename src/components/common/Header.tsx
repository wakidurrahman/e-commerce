'use client';

import { useCart } from '@/hooks/useCart';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  Badge,
  Button,
  Container,
  Form,
  FormControl,
  Nav,
  Navbar,
} from 'react-bootstrap';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Initialize search with current query parameter
  const initialQuery = searchParams.get('q') || '';
  const { searchValue, debouncedSearchValue, setSearchValue } =
    useDebouncedSearch(initialQuery, 300);

  // Handle debounced search navigation
  useEffect(() => {
    if (debouncedSearchValue.trim() && debouncedSearchValue !== initialQuery) {
      router.push(
        `/search?q=${encodeURIComponent(debouncedSearchValue.trim())}`
      );
    }
  }, [debouncedSearchValue, router, initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="mb-4">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand>
            <strong>NextShop</strong>
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link>Home</Nav.Link>
            </Link>
            <Link href="/products" passHref legacyBehavior>
              <Nav.Link>Products</Nav.Link>
            </Link>
            <Link href="/categories" passHref legacyBehavior>
              <Nav.Link>Categories</Nav.Link>
            </Link>
          </Nav>

          {/* Search Form */}
          <Form className="d-flex me-3" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search products..."
              className="me-2"
              aria-label="Search"
              value={searchValue}
              onChange={handleSearchChange}
              style={{ minWidth: '200px' }}
            />
            <Button variant="outline-light" type="submit">
              Search
            </Button>
          </Form>

          {/* Cart Link */}
          <Nav>
            <Link href="/cart" passHref legacyBehavior>
              <Nav.Link className="position-relative">
                <i className="bi bi-cart3" style={{ fontSize: '1.5rem' }}></i>
                {totalItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
                <span className="ms-1 d-none d-lg-inline">Cart</span>
              </Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
