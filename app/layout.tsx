import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GIGS - On-Demand Event Staffing Marketplace',
  description: 'Connect event organizers with qualified staff for seamless event experiences.',
  keywords: ['event staffing', 'gig work', 'marketplace', 'events'],
  authors: [{ name: 'GIGS Team' }],
  creator: 'GIGS',
  publisher: 'GIGS',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'GIGS - On-Demand Event Staffing Marketplace',
    description: 'Connect event organizers with qualified staff for seamless event experiences.',
    siteName: 'GIGS',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        {children}
      </body>
    </html>
  );
}