'use client';

import { useState } from 'react';
import { Filter, ExternalLink, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - in real app would come from API
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      amount: '0.5 SOL',
      status: 'completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      signature: '5ZJKmNqP7bF9vXjYGH3KkGLR8TtXwVzYpQrS4CdN2Mjx',
      from: 'External Wallet',
      to: 'Smart Account',
    },
    {
      id: '2',
      type: 'swap',
      amount: '100 USDC → 0.45 SOL',
      status: 'completed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      signature: '3KLMnOpQ8cG6yXkZIJ4LlHMS9UuYxWaZqRtT5DeO3Nky',
      from: 'USDC',
      to: 'SOL',
    },
    {
      id: '3',
      type: 'withdraw',
      amount: '0.2 SOL',
      status: 'pending',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      signature: '8NOPqRsT9dH7zYlAKJ5MmIOT0VvZyXbZrStU6EfP4Okz',
      from: 'Smart Account',
      to: 'External Wallet',
    },
    {
      id: '4',
      type: 'swap',
      amount: '0.3 SOL → 85 USDC',
      status: 'failed',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      signature: '7MNOqRsT8cG6yXkZIJ4LlHMS9UuYxWaZqRtT5DeO3Nkz',
      from: 'SOL',
      to: 'USDC',
      error: 'Insufficient balance',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'swap':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'failed':
        return <span className="badge badge-error">Failed</span>;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const shortenSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Transaction History
            </h1>
            <p className="text-gray-600">
              View all your smart account transactions and their status
            </p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex space-x-2">
                  {['all', 'deposit', 'withdraw', 'swap'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filter === type
                          ? 'bg-primary-100 text-primary-800'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredTransactions.length} transactions
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="card">
            {paginatedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'You haven\'t made any transactions yet'
                    : `No ${filter} transactions found`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getIcon(tx.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {tx.type}
                          </span>
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tx.amount}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tx.from} → {tx.to}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {formatTimestamp(tx.timestamp)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {shortenSignature(tx.signature)}
                        </div>
                        {tx.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {tx.error}
                          </div>
                        )}
                      </div>
                      
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View on Solana Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}