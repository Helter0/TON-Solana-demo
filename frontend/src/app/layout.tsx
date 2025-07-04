import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SolanaProvider } from '@/components/providers/SolanaProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TON-Solana Smart Wallet',
  description: 'Cross-chain smart wallet: TON authentication for Solana account management',
  keywords: ['TON', 'Solana', 'Smart Wallet', 'Cross-chain', 'DeFi'],
  authors: [{ name: 'TON-Solana Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
};

const manifestUrl = process.env.NEXT_PUBLIC_MANIFEST_URL || 'https://ton-solana-wallet.com/tonconnect-manifest.json';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <QueryProvider>
            <SolanaProvider>
              <div className="min-h-screen">
                {children}
              </div>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }}
              />
            </SolanaProvider>
          </QueryProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  );
}