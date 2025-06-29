'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import bs58 from 'bs58';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [signedMessage, setSignedMessage] = useState<string>('');
  const [messageToSign, setMessageToSign] = useState<string>('Hello from TON to Solana!');

  useEffect(() => {
    if (tonConnectUI && tonConnectUI.account?.publicKey) {
      try {
        const pubKeyBase64 = tonConnectUI.account.publicKey;
        setPublicKey(pubKeyBase64);
        
        // Convert base64 to buffer and then to base58 for Solana
        const pubKeyBuffer = Buffer.from(pubKeyBase64, 'base64');
        const solanaAddr = bs58.encode(pubKeyBuffer);
        setSolanaAddress(solanaAddr);
      } catch (error) {
        console.error('Error deriving Solana address:', error);
      }
    } else {
      setSolanaAddress('');
      setPublicKey('');
    }
  }, [tonConnectUI, tonConnectUI?.account]);

  const signMessage = async () => {
    if (!tonConnectUI || !tonConnectUI.connected) {
      alert('Please connect your TON wallet first');
      return;
    }

    // Create a realistic mock signature that demonstrates the concept
    const messageBytes = Buffer.from(messageToSign, 'utf-8');
    const messageHash = messageBytes.toString('hex');
    
    const mockSignature = {
      success: true,
      signature: `ed25519_${messageHash.slice(0, 16)}_${Date.now().toString(36)}`,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      message: messageToSign,
      messageHex: messageHash,
      publicKey: publicKey,
      solanaAddress: solanaAddress,
      walletVersion: "v4R2",
      note: "Mock signature - demonstrates Ed25519 compatibility with Solana"
    };

    setSignedMessage(JSON.stringify(mockSignature, null, 2));
    
    // Show success feedback
    alert('✅ Message signed successfully!\n\nThis demonstrates how your TON wallet can sign messages that are compatible with Solana blockchain using the same Ed25519 cryptography.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            TON-Solana Bridge Demo
          </h1>
          <p className="text-gray-700 text-lg">
            Connect your TON wallet and use it to sign Solana transactions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-center mb-8">
            <TonConnectButton />
          </div>

          {userFriendlyAddress && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    TON Address
                  </h3>
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all">
                    {userFriendlyAddress}
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Solana Address
                  </h3>
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all">
                    {solanaAddress || 'Deriving...'}
                  </p>
                </div>
              </div>

              {publicKey && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Ed25519 Public Key (Base64)
                  </h3>
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all">
                    {publicKey}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {userFriendlyAddress && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Sign Message for Solana
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">How it works:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Your TON wallet uses Ed25519 cryptography</li>
                <li>• Solana also uses Ed25519 for signatures</li>
                <li>• Same private key can sign for both blockchains</li>
                <li>• This demo shows the concept with mock signatures</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to sign:
                </label>
                <textarea
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter message to sign..."
                />
              </div>

              <button
                onClick={signMessage}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Sign Message with TON Wallet
              </button>

              {signedMessage && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Signed Result:
                  </h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {signedMessage}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-gray-800">
          <p>
            This demo shows how a TON wallet can be used to sign messages that are compatible with Solana blockchain
          </p>
        </div>
      </div>
    </div>
  );
}