'use client';

import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';

export function AccountInfo() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { tonAddress, smartAccountAddress } = useWalletStore();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, type: 'ton' | 'solana') => {
    if (type === 'ton') {
      return `https://tonviewer.com/${address}`;
    }
    return `https://solscan.io/account/${address}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">
          Account Information
        </h2>
        <p className="text-gray-600">
          Your TON wallet is connected and linked to a Solana smart account
        </p>
      </div>

      <div className="space-y-4">
        {/* TON Address */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">TON Address</div>
            <div className="font-mono text-sm text-gray-900">
              {tonAddress ? shortenAddress(tonAddress) : 'Not connected'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {tonAddress && (
              <>
                <button
                  onClick={() => copyToClipboard(tonAddress, 'ton')}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy address"
                >
                  {copiedField === 'ton' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={getExplorerUrl(tonAddress, 'ton')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="View on TON Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Smart Account Address */}
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex-1">
            <div className="text-sm text-primary-700 mb-1">Smart Account (Solana)</div>
            <div className="font-mono text-sm text-primary-900">
              {smartAccountAddress ? shortenAddress(smartAccountAddress) : 'Not created yet'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {smartAccountAddress && (
              <>
                <button
                  onClick={() => copyToClipboard(smartAccountAddress, 'solana')}
                  className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                  title="Copy address"
                >
                  {copiedField === 'solana' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={getExplorerUrl(smartAccountAddress, 'solana')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                  title="View on Solana Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Create Account Button */}
        {!smartAccountAddress && (
          <button className="w-full btn btn-primary">
            Create Smart Account
          </button>
        )}

        {/* Status */}
        <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-800 font-medium">TON Wallet Connected</span>
        </div>
      </div>
    </div>
  );
}