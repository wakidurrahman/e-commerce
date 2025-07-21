'use client';

import { useEffect } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

// 🚨 App Router Error UI - Shows when page.tsx fails
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Homepage error:', error);
  }, [error]);

  return (
    <Container>
      <div className="text-center py-5">
        <div className="mb-4">
          <i
            className="bi bi-exclamation-triangle text-danger"
            style={{ fontSize: '4rem' }}
          ></i>
        </div>

        <h2 className="mb-3">Oops! Something went wrong</h2>

        <Alert
          variant="danger"
          className="text-start mx-auto"
          style={{ maxWidth: '600px' }}
        >
          <Alert.Heading>Error Details</Alert.Heading>
          <p className="mb-0">
            {error.message || 'Failed to load the homepage. Please try again.'}
          </p>
          {error.digest && (
            <small className="text-muted d-block mt-2">
              Error ID: {error.digest}
            </small>
          )}
        </Alert>

        <div className="d-flex gap-3 justify-content-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline-secondary" href="/">
            Refresh Page
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-muted">
            If this problem persists, please{' '}
            <a href="/contact">contact support</a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
