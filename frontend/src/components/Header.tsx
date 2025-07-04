'use client';

import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { TonConnectButton } from './TonConnectButton';
import { useWalletStore } from '@/store/walletStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { smartAccountAddress } = useWalletStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Swap', href: '/swap' },
    { name: 'History', href: '/history' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TON-Solana</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Smart Account Address */}
            {smartAccountAddress && (
              <div className="hidden md:block">
                <div className="text-xs text-gray-500">Smart Account</div>
                <div className="text-sm font-mono text-gray-700">
                  {`${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}`}
                </div>
              </div>
            )}
            
            {/* TON Connect Button */}
            <TonConnectButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            
            {/* Mobile Smart Account Info */}
            {smartAccountAddress && (
              <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Smart Account</div>
                <div className="text-sm font-mono text-gray-700">
                  {smartAccountAddress}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}