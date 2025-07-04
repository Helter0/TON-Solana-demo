'use client';

import { useState } from 'react';
import { ArrowUpDown, TrendingUp, Settings } from 'lucide-react';
import { Header } from '@/components/Header';
import { useWalletStore } from '@/store/walletStore';

export default function SwapPage() {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  
  const { smartAccountAddress } = useWalletStore();

  const tokens = [
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  ];

  const [inputToken, setInputToken] = useState(tokens[0]);
  const [outputToken, setOutputToken] = useState(tokens[1]);

  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  };

  const handleSwap = async () => {
    if (!smartAccountAddress) {
      alert('Please create a smart account first');
      return;
    }

    setIsLoading(true);
    try {
      // In real implementation, this would:
      // 1. Prepare operation via API
      // 2. Sign with TON Connect
      // 3. Execute the swap
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Swap completed successfully!');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Swap Tokens
                </h1>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600">
                Trade tokens on Jupiter DEX with TON signature authorization
              </p>
            </div>

            <div className="space-y-4">
              {/* Input Token */}
              <div className="space-y-2">
                <label className="label">From</label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.0"
                    className="input pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <select
                      value={inputToken.symbol}
                      onChange={(e) => {
                        const token = tokens.find(t => t.symbol === e.target.value);
                        if (token) setInputToken(token);
                      }}
                      className="bg-transparent border-none outline-none font-medium text-gray-900"
                    >
                      {tokens.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Balance: 0.00 {inputToken.symbol}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapTokens}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Output Token */}
              <div className="space-y-2">
                <label className="label">To</label>
                <div className="relative">
                  <input
                    type="number"
                    value={outputAmount}
                    placeholder="0.0"
                    readOnly
                    className="input pr-20 bg-gray-50"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <select
                      value={outputToken.symbol}
                      onChange={(e) => {
                        const token = tokens.find(t => t.symbol === e.target.value);
                        if (token) setOutputToken(token);
                      }}
                      className="bg-transparent border-none outline-none font-medium text-gray-900"
                    >
                      {tokens.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Balance: 0.00 {outputToken.symbol}
                </div>
              </div>

              {/* Swap Details */}
              {inputAmount && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate</span>
                    <span className="text-gray-900">1 {inputToken.symbol} = 2.5 {outputToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Slippage Tolerance</span>
                    <span className="text-gray-900">{slippage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price Impact</span>
                    <span className="text-green-600">0.1%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Minimum Received</span>
                    <span className="text-gray-900">{(parseFloat(outputAmount || '0') * (1 - slippage / 100)).toFixed(4)} {outputToken.symbol}</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!inputAmount || !smartAccountAddress || isLoading}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loader mr-2"></div>
                    Swapping...
                  </div>
                ) : !smartAccountAddress ? (
                  'Create Smart Account First'
                ) : !inputAmount ? (
                  'Enter Amount'
                ) : (
                  `Swap ${inputToken.symbol} for ${outputToken.symbol}`
                )}
              </button>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This will create a transaction that requires your TON wallet signature.
                  Make sure to review all details before confirming.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Swaps */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Swaps
            </h3>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No swaps yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your swap history will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}