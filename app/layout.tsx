/**
 * Root Layout Component for GIGS Platform
 * 
 * This is the main layout wrapper for the entire application.
 * It includes global styles, metadata, and error boundary setup.
 */

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Inter font configuration for optimal performance
 */
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Application metadata configuration
 * Optimized for SEO and social media sharing
 */
export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    'event staffing',
    'gig work',
    'marketplace',
    'events',
    'temporary staff',
    'event workers',
    'on-demand staffing',
    'freelance',
  ],
  authors: [{ name: `${APP_CONFIG.name} Team` }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  robots: 'index, follow',
  metadataBase: new URL(APP_CONFIG.url),
  openGraph: {
    type: 'website',
    title: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
    description: 'Connect event organizers with qualified staff for seamless event experiences.',
    siteName: APP_CONFIG.name,
    url: APP_CONFIG.url,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
    description: 'Connect event organizers with qualified staff for seamless event experiences.',
    creator: '@gigs',
  },
};

/**
 * Root layout component
 * Wraps the entire application with necessary providers and error boundaries
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={cn(
        inter.variable,
        "min-h-screen antialiased font-sans bg-background text-foreground"
      )}>
        <ErrorBoundary>
          <div id="app-root" className="relative">
            {children}
          </div>
        </ErrorBoundary>
        
        {/* Portal for modals and overlays */}
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}