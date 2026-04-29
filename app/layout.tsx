import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'TradePunch',
  description: 'Stress-test your trading plan with AI',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
          {children}
        </div>
      </body>
    </html>
  );
}