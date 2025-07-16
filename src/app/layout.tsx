import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { Providers } from '@/providers';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextShop - E-commerce Platform',
  description: 'Your one-stop destination for quality products at great prices',
  keywords: 'e-commerce, shopping, products, deals, online store',
  authors: [{ name: 'NextShop Team' }],
  creator: 'NextShop',
  publisher: 'NextShop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'NextShop - E-commerce Platform',
    description:
      'Your one-stop destination for quality products at great prices',
    url: 'https://nextshop.example.com',
    siteName: 'NextShop',
    images: [
      {
        url: 'https://nextshop.example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NextShop',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextShop - E-commerce Platform',
    description:
      'Your one-stop destination for quality products at great prices',
    creator: '@nextshop',
    images: ['https://nextshop.example.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
