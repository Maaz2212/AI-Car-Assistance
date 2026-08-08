import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Car Matchmaker — Night Showroom',
  description: 'Conversational AI concierge for renting & buying vehicles with A2UI catalogue and sandboxed MCP Apps',
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
