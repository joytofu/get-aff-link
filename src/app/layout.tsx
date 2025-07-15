import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GETAFF.LINK',
  description: 'Uncover the true destination and tracking parameters of any affiliate link',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
