import Navbar from './components/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GETAFF.LINK',
  description: 'Uncover the true destination and tracking parameters of any affiliate link',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="dark">
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      <body className={inter.className}>
        <Navbar />
        {children}
        <footer className="bg-gray-900 text-white py-12 mt-auto">
          <div className="container mx-auto px-4 md:px-6">
            <nav>
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
                <li><a href="/about-us" className="hover:text-gray-300 transition-colors duration-200">About Us</a></li>
                <li><a href="/contact-us" className="hover:text-gray-300 transition-colors duration-200">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-gray-300 transition-colors duration-200">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-gray-300 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="/blogs" className="hover:text-gray-300 transition-colors duration-200">Blogs</a></li>
              </ul>
            </nav>
            <div className="mt-8 text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} GETAFF.LINK. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
