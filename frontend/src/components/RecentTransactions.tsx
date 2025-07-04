'use client';

import { ExternalLink, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

export function RecentTransactions() {
  // Mock data - in real app would come from API
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      amount: '0.5 SOL',
      status: 'completed',
      timestamp: '2 hours ago',
      signature: '5ZJK...',
    },
    {
      id: '2',
      type: 'swap',
      amount: '100 USDC → 0.45 SOL',
      status: 'completed',
      timestamp: '1 day ago',
      signature: '3KLM...',
    },
    {
      id: '3',
      type: 'withdraw',
      amount: '0.2 SOL',
      status: 'pending',
      timestamp: '2 days ago',
      signature: '8NOP...',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'swap':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
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

  if (transactions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your transaction history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h3>
        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getIcon(tx.type)}
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {tx.type}
                </div>
                <div className="text-sm text-gray-500">
                  {tx.amount}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-900">
                  {getStatusBadge(tx.status)}
                </div>
                <div className="text-xs text-gray-500">
                  {tx.timestamp}
                </div>
              </div>
              
              <a
                href={`https://solscan.io/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}