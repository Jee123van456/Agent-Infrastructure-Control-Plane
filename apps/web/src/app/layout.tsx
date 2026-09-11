import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TylerDeck — Observe. Evaluate. Secure. Ship AI Agents.',
  description: 'The production control plane for AI agents. Turn raw telemetry into actionable engineering intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 antialiased min-h-screen grid-bg">
        {children}
      </body>
    </html>
  );
}
