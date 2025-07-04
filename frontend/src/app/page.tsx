'use client';

import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Globe,
  Coins,
  TrendingUp 
} from 'lucide-react';
import { TonConnectButton } from '@/components/TonConnectButton';

export default function HomePage() {
  const [tonConnectUI] = useTonConnectUI();
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  const handleGetStarted = async () => {
    if (tonConnectUI?.connected) {
      router.push('/dashboard');
    } else {
      // Will trigger TON Connect
      await tonConnectUI?.openModal();
    }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Authentication',
      description: 'Use your TON Wallet to securely authenticate and manage Solana accounts without exposing private keys.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Execute transactions on Solana with the speed and efficiency of TON blockchain authentication.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Cross-Chain',
      description: 'Bridge the gap between TON and Solana ecosystems with seamless cross-chain functionality.',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'DeFi Integration',
      description: 'Trade on Jupiter DEX and manage your Solana assets with TON-powered smart contracts.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Advanced Trading',
      description: 'Access sophisticated trading features with built-in slippage protection and MEV resistance.',
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Smart Wallets',
      description: 'Program Derived Address (PDA) accounts that you control with TON signatures.',
    },
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.5M+' },
    { label: 'Transactions Processed', value: '50K+' },
    { label: 'Active Users', value: '2.5K+' },
    { label: 'Success Rate', value: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TON-Solana</span>
            </div>
            <TonConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Cross-Chain Smart Wallet
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Authenticate with TON Wallet to manage Solana accounts securely. 
              Trade on Jupiter DEX without exposing private keys.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                onClick={handleGetStarted}
                className="btn btn-primary px-8 py-3 text-lg group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn btn-outline px-8 py-3 text-lg">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TON-Solana Smart Wallet?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the future of cross-chain DeFi with enterprise-grade security and seamless user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="card hover-lift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started with TON-Solana Smart Wallet in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect TON Wallet',
                description: 'Connect your TON Wallet using TON Connect protocol for secure authentication.',
              },
              {
                step: '02',
                title: 'Create Smart Account',
                description: 'Generate a Program Derived Address (PDA) on Solana linked to your TON public key.',
              },
              {
                step: '03',
                title: 'Start Trading',
                description: 'Deposit funds, trade on Jupiter DEX, and manage your assets with TON signatures.',
              },
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Experience the Future of DeFi?
            </motion.h2>
            <motion.p 
              className="text-xl text-primary-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands of users who are already trading cross-chain with TON-Solana Smart Wallet.
            </motion.p>
            <motion.button 
              onClick={handleGetStarted}
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TON-Solana</span>
              </div>
              <p className="text-gray-400">
                Cross-chain smart wallet for the future of DeFi.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Smart Wallet</a></li>
                <li><a href="#" className="hover:text-white">Trading</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TON-Solana Smart Wallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}