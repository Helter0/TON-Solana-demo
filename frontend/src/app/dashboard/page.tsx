'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Settings,
  History,
  QrCode
} from 'lucide-react';
import { Header } from '@/components/Header';
import { AccountInfo } from '@/components/AccountInfo';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentTransactions } from '@/components/RecentTransactions';
import { DepositModal } from '@/components/DepositModal';
import { useWalletStore } from '@/store/walletStore';

export default function DashboardPage() {
  const router = useRouter();
  const [tonConnectUI] = useTonConnectUI();
  const { isConnected, tonAddress, smartAccountAddress } = useWalletStore();

  useEffect(() => {
    if (!tonConnectUI?.connected) {
      router.push('/');
    }
  }, [tonConnectUI?.connected, router]);

  if (!tonConnectUI?.connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to TON Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Smart Wallet
          </h1>
          <p className="text-gray-600">
            Manage your cross-chain assets with TON-powered security
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <AccountInfo />
            </motion.div>

            {/* Balance Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BalanceCard 
                title="SOL Balance"
                balance="0.00"
                usdValue="$0.00"
                icon={<Wallet className="w-6 h-6" />}
                gradient="from-purple-500 to-purple-700"
              />
              <BalanceCard 
                title="Token Balance"
                balance="0"
                usdValue="$0.00"
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="from-blue-500 to-blue-700"
              />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <QuickActions />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <RecentTransactions />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Volume</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/swap')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Swap Tokens</span>
                </button>
                <button 
                  onClick={() => router.push('/history')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Transaction History</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <QrCode className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Deposit Address</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">Settings</span>
                </button>
              </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div 
              className="card bg-primary-50 border-primary-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    Secure by Design
                  </h4>
                  <p className="text-sm text-primary-800">
                    Your private keys never leave your TON Wallet. All transactions are signed securely.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}