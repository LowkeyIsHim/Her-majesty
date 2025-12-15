import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Silvyn - A Quiet Space',
  description: 'A place built with love, just for you',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
