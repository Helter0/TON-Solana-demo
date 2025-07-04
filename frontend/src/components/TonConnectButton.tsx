'use client';

import { TonConnectButton as TonConnectButtonUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useWalletStore } from '@/store/walletStore';

export function TonConnectButton() {
  const [tonConnectUI] = useTonConnectUI();
  const { setConnection, setTonAddress, setSmartAccountAddress } = useWalletStore();

  useEffect(() => {
    if (tonConnectUI) {
      const unsubscribe = tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
          setConnection(true);
          setTonAddress(wallet.account.address);
          // In a real app, you'd derive the smart account address from the TON address
          // For now, we'll set it to null and let the dashboard handle account creation
          setSmartAccountAddress(null);
        } else {
          setConnection(false);
          setTonAddress(null);
          setSmartAccountAddress(null);
        }
      });

      return () => unsubscribe?.();
    }
  }, [tonConnectUI, setConnection, setTonAddress, setSmartAccountAddress]);

  return (
    <TonConnectButtonUI />
  );
}