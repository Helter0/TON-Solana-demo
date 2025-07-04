'use client';

import { useState } from 'react';
import { X, Copy, QrCode } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
}

export function DepositModal({ isOpen, onClose, address }: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Deposit to Smart Account
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {address ? (
          <div className="space-y-4">
            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Smart Account Address
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={copyAddress}
                  className="btn btn-outline px-3 py-2"
                >
                  {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                How to deposit:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Send SOL or SPL tokens to this address</li>
                <li>• Transactions are usually confirmed within 30 seconds</li>
                <li>• Your balance will update automatically</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Only send Solana network tokens (SOL, USDC, etc.) to this address.
                Do not send tokens from other networks.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Create a smart account first to get your deposit address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}