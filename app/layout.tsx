import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'hyderabad.properties - Independent Property Verification',
  description: 'Independent property verification by House of Investors. Checks RERA registration, approvals, lake buffer zones, and true costs in seconds.',
  openGraph: {
    title: 'hyderabad.properties - Independent Property Verification',
    description: 'Independent property verification by House of Investors. Checks RERA registration, approvals, lake buffer zones, and true costs in seconds.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hyderabad.properties - Independent Property Verification',
    description: 'Independent property verification by House of Investors. Checks RERA registration, approvals, lake buffer zones, and true costs in seconds.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#F2F2F2] text-[#131313] antialiased font-sans selection:bg-[#D6FD70] selection:text-[#131313]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
