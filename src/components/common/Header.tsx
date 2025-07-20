'use client';

import { useCart } from '@/hooks/useCart';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by ensuring client renders same as server initially
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        <Navbar.Brand as={Link} href="/">
          <strong>NextShop</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/products">
              Products
            </Nav.Link>
            <Nav.Link as={Link} href="/categories">
              Categories
            </Nav.Link>
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
            <Nav.Link as={Link} href="/cart" className="position-relative">
              <i className="bi bi-cart3" style={{ fontSize: '1.5rem' }}></i>
              {isMounted && totalItems > 0 && (
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
