'use client';

import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [tonConnectUI] = useTonConnectUI();
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(wallet => {
      setWalletInfo(wallet);
    });

    return () => unsubscribe?.();
  }, [tonConnectUI]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TON-Solana</span>
            </div>
            <TonConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Cross-Chain Smart Wallet
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Authenticate with TON Wallet to manage Solana accounts securely. 
            Trade on Jupiter DEX without exposing private keys.
          </p>

          {walletInfo ? (
            <div className="card max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎉 TON Wallet Connected!
              </h2>
              <div className="space-y-2 text-left">
                <p><strong>Address:</strong> {walletInfo.account.address.slice(0, 6)}...{walletInfo.account.address.slice(-4)}</p>
                <p><strong>Chain:</strong> {walletInfo.account.chain}</p>
                <p><strong>Public Key:</strong> {walletInfo.account.publicKey?.slice(0, 8)}...</p>
              </div>
            </div>
          ) : (
            <div className="card max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Connect your TON Wallet
              </h2>
              <p className="text-gray-600 mb-4">
                Click the "Connect Wallet" button above to get started with TON-Solana Smart Wallet.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Secure Authentication
            </h3>
            <p className="text-gray-600">
              Use your TON Wallet to securely authenticate and manage Solana accounts.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Execute transactions on Solana with TON blockchain authentication.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Wallets
            </h3>
            <p className="text-gray-600">
              Program Derived Address accounts controlled by TON signatures.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}