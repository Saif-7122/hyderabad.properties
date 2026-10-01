import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'hyderabad.properties',
  description: 'Trust-first property safety guide for Hyderabad by House of Investors. Know if a property is safe before you fall in love with it.',
  openGraph: {
    title: 'hyderabad.properties',
    description: 'Trust-first property safety guide for Hyderabad by House of Investors. Know if a property is safe before you fall in love with it.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hyderabad.properties',
    description: 'Trust-first property safety guide for Hyderabad by House of Investors. Know if a property is safe before you fall in love with it.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#0F1B2D] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
