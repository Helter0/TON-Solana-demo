import type { Metadata } from 'next';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TON-Solana Smart Wallet',
  description: 'Cross-chain smart wallet demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
          {children}
          <Toaster position="top-right" />
        </TonConnectUIProvider>
      </body>
    </html>
  );
}