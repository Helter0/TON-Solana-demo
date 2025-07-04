'use client';

import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'Deposit',
      icon: <ArrowDownLeft className="w-5 h-5" />,
      onClick: () => {
        // Open deposit modal
        console.log('Open deposit modal');
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Withdraw',
      icon: <ArrowUpRight className="w-5 h-5" />,
      onClick: () => {
        // Open withdraw modal
        console.log('Open withdraw modal');
      },
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Swap',
      icon: <TrendingUp className="w-5 h-5" />,
      onClick: () => {
        router.push('/swap');
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Refresh',
      icon: <RefreshCw className="w-5 h-5" />,
      onClick: () => {
        // Refresh balances
        console.log('Refresh balances');
      },
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-white transition-colors ${action.color}`}
          >
            {action.icon}
            <span className="text-sm font-medium mt-2">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}