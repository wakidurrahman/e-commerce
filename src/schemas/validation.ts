import { z } from 'zod';

// Shipping Information Schema
export const shippingInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),

  address: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),

  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),

  state: z
    .string()
    .min(1, 'State is required')
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters'),

  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(
      /^\d{5}(-\d{4})?$/,
      'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
    ),

  country: z.string().min(1, 'Country is required'),
});

// Payment Information Schema
export const paymentInfoSchema = z.object({
  paymentMethod: z.enum(['credit', 'debit', 'paypal'], {
    message: 'Please select a payment method',
  }),

  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(
      /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
      'Please enter a valid 16-digit card number'
    ),

  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      'Please enter a valid expiry date (MM/YY)'
    )
    .refine((value) => {
      const [month, year] = value.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;

      return true;
    }, 'Card has expired'),

  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),

  cardholderName: z
    .string()
    .min(1, 'Cardholder name is required')
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100, 'Cardholder name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s]+$/,
      'Cardholder name can only contain letters and spaces'
    ),
});

// Combined Checkout Form Schema
export const checkoutFormSchema = shippingInfoSchema
  .merge(paymentInfoSchema)
  .extend({
    sameAsBilling: z.boolean(),
  });

// Contact/Support Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Newsletter Subscription Schema
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  preferences: z.array(z.string()).optional(),
});

// Product Review Schema
export const productReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating cannot exceed 5 stars'),

  title: z
    .string()
    .min(1, 'Review title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),

  comment: z
    .string()
    .min(1, 'Review comment is required')
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters'),

  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  wouldRecommend: z.boolean().optional(),
});

// Search Filters Schema
export const searchFiltersSchema = z
  .object({
    query: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
    maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
    rating: z.number().min(1).max(5).optional(),
    inStock: z.boolean().optional(),
    sortBy: z.enum(['title', 'price', 'rating', 'createdAt']).default('title'),
    order: z.enum(['asc', 'desc']).default('asc'),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Minimum price cannot be greater than maximum price',
      path: ['maxPrice'],
    }
  );

// Type exports for use in components
export type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;
export type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ProductReviewFormData = z.infer<typeof productReviewSchema>;
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;
