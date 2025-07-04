import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  // TON Connection
  isConnected: boolean;
  tonAddress: string | null;
  tonPublicKey: string | null;
  
  // Smart Account
  smartAccountAddress: string | null;
  smartAccountNonce: number;
  
  // Balances
  solBalance: number;
  tokenBalances: TokenBalance[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConnection: (connected: boolean) => void;
  setTonAddress: (address: string | null) => void;
  setTonPublicKey: (publicKey: string | null) => void;
  setSmartAccountAddress: (address: string | null) => void;
  setSmartAccountNonce: (nonce: number) => void;
  setSolBalance: (balance: number) => void;
  setTokenBalances: (balances: TokenBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
}

const initialState = {
  isConnected: false,
  tonAddress: null,
  tonPublicKey: null,
  smartAccountAddress: null,
  smartAccountNonce: 0,
  solBalance: 0,
  tokenBalances: [],
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setConnection: (connected) => set({ isConnected: connected }),
      
      setTonAddress: (address) => set({ tonAddress: address }),
      
      setTonPublicKey: (publicKey) => set({ tonPublicKey: publicKey }),
      
      setSmartAccountAddress: (address) => set({ smartAccountAddress: address }),
      
      setSmartAccountNonce: (nonce) => set({ smartAccountNonce: nonce }),
      
      setSolBalance: (balance) => set({ solBalance: balance }),
      
      setTokenBalances: (balances) => set({ tokenBalances: balances }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'ton-solana-wallet',
      partialize: (state) => ({
        tonAddress: state.tonAddress,
        tonPublicKey: state.tonPublicKey,
        smartAccountAddress: state.smartAccountAddress,
        smartAccountNonce: state.smartAccountNonce,
      }),
    }
  )
);

// Selectors
export const useWalletConnection = () => {
  const store = useWalletStore();
  return {
    isConnected: store.isConnected,
    tonAddress: store.tonAddress,
    smartAccountAddress: store.smartAccountAddress,
  };
};

export const useWalletBalances = () => {
  const store = useWalletStore();
  return {
    solBalance: store.solBalance,
    tokenBalances: store.tokenBalances,
    isLoading: store.isLoading,
  };
};

export const useWalletActions = () => {
  const store = useWalletStore();
  return {
    setConnection: store.setConnection,
    setTonAddress: store.setTonAddress,
    setTonPublicKey: store.setTonPublicKey,
    setSmartAccountAddress: store.setSmartAccountAddress,
    setSmartAccountNonce: store.setSmartAccountNonce,
    setSolBalance: store.setSolBalance,
    setTokenBalances: store.setTokenBalances,
    setLoading: store.setLoading,
    setError: store.setError,
    reset: store.reset,
  };
};