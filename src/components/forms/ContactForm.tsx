'use client';

import { ContactFormData, contactFormSchema } from '@/schemas/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>;
  className?: string;
}

export default function ContactForm({
  onSubmit,
  className = '',
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Watch form values for character count
  const messageValue = watch('message');
  const messageLength = messageValue?.length || 0;

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('Contact form submitted:', data);
      }

      setSubmitSuccess(true);
      reset(); // Clear form on successful submission
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting the form'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <Card.Header>
        <h4 className="mb-0">Contact Us</h4>
      </Card.Header>
      <Card.Body>
        {/* Success Message */}
        {submitSuccess && (
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            Thank you for your message! We&apos;ll get back to you soon.
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {submitError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Name Field */}
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              {...register('name')}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email Field */}
          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Subject Field */}
          <Form.Group className="mb-3">
            <Form.Label>Subject *</Form.Label>
            <Form.Control
              type="text"
              placeholder="What is this regarding?"
              {...register('subject')}
              isInvalid={!!errors.subject}
            />
            <Form.Control.Feedback type="invalid">
              {errors.subject?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Message Field */}
          <Form.Group className="mb-3">
            <Form.Label>
              Message *
              <span className="text-muted small">
                ({messageLength}/1000 characters)
              </span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Please describe your inquiry in detail..."
              {...register('message')}
              isInvalid={!!errors.message}
            />
            <Form.Control.Feedback type="invalid">
              {errors.message?.message}
            </Form.Control.Feedback>
            {messageLength > 900 && messageLength <= 1000 && (
              <Form.Text className="text-warning">
                Approaching character limit ({messageLength}/1000)
              </Form.Text>
            )}
          </Form.Group>

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending Message...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>

          {/* Form Validation Info */}
          <div className="mt-3">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              All fields marked with * are required. We&apos;ll respond within
              24 hours.
            </small>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

// Example usage component for demonstration
export function ContactFormExample() {
  const handleContactSubmit = async (data: ContactFormData) => {
    // Simulate API call
    console.log('Submitting contact form:', data);

    // You would typically send this to your API
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <ContactForm onSubmit={handleContactSubmit} />
        </div>
      </div>
    </div>
  );
}
