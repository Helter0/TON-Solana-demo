import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  transpilePackages: ['@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
  serverExternalPackages: ['@solana/web3.js'],
};

export default nextConfig;