import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Car Assistance & Vehicle Matchmaker',
  description: 'Interactive vehicle matchmaker for browsing, comparing, renting, and purchasing vehicles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-showroom-bg text-showroom-ink">
        {children}
      </body>
    </html>
  );
}
