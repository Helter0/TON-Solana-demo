'use client';

import { ReactNode } from 'react';

interface BalanceCardProps {
  title: string;
  balance: string;
  usdValue: string;
  icon: ReactNode;
  gradient: string;
}

export function BalanceCard({ title, balance, usdValue, icon, gradient }: BalanceCardProps) {
  return (
    <div className="card hover-lift">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {balance}
        </div>
        <div className="text-gray-600">
          {usdValue}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">24h Change</span>
          <span className="text-green-600 font-medium">+0.00%</span>
        </div>
      </div>
    </div>
  );
}