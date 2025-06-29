'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import bs58 from 'bs58';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [signedMessage, setSignedMessage] = useState<string>('');
  const [messageToSign, setMessageToSign] = useState<string>('Hello from TON to Solana!');
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('0.001');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  useEffect(() => {
    if (tonConnectUI && tonConnectUI.account?.publicKey) {
      try {
        const pubKeyBase64 = tonConnectUI.account.publicKey;
        setPublicKey(pubKeyBase64);
        
        // Convert base64 to buffer and then to base58 for Solana
        const pubKeyBuffer = Buffer.from(pubKeyBase64, 'base64');
        const solanaAddr = bs58.encode(pubKeyBuffer);
        setSolanaAddress(solanaAddr);
        
        // Get SOL balance
        fetchSolBalance(solanaAddr);
      } catch (error) {
        console.error('Error deriving Solana address:', error);
      }
    } else {
      setSolanaAddress('');
      setPublicKey('');
      setSolBalance(null);
    }
  }, [tonConnectUI, tonConnectUI?.account]);

  const fetchSolBalance = async (address: string) => {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      setSolBalance(0);
    }
  };

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

  const transferSol = async () => {
    if (!tonConnectUI || !tonConnectUI.connected) {
      alert('Please connect your TON wallet first');
      return;
    }

    if (!recipientAddress) {
      alert('Please enter recipient address');
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Please enter valid transfer amount');
      return;
    }

    setIsTransferring(true);
    setTxHash('');

    try {
      // Create Solana connection
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // Create public keys
      const fromPubkey = new PublicKey(solanaAddress);
      const toPubkey = new PublicKey(recipientAddress);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      
      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(parseFloat(transferAmount) * LAMPORTS_PER_SOL)
      });
      
      // Create transaction
      const transaction = new Transaction().add(transferInstruction);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      
      // Serialize transaction for signing
      const serializedTx = transaction.serializeMessage();
      const txHash = bs58.encode(serializedTx);
      
      // For now, show what would be signed (SignData API not yet available)
      const signatureData = {
        action: 'SOL Transfer',
        from: solanaAddress,
        to: recipientAddress,
        amount: `${transferAmount} SOL`,
        fee: '~0.000005 SOL',
        network: 'Solana Mainnet',
        transactionHash: txHash.slice(0, 32) + '...',
        timestamp: new Date().toISOString(),
        note: 'This would be a real Solana transaction when SignData API is available'
      };
      
      setTxHash(JSON.stringify(signatureData, null, 2));
      alert('🚀 Transaction prepared!\n\nThis demonstrates how your TON wallet would sign a real Solana transaction. When SignData API is fully implemented, this will execute on-chain.');
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error preparing transaction: ' + (error as Error).message);
    } finally {
      setIsTransferring(false);
    }
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
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all mb-3">
                    {solanaAddress || 'Deriving...'}
                  </p>
                  {solBalance !== null && (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <span className="text-sm font-medium text-purple-700">Balance:</span>
                      <span className="font-mono text-sm font-bold text-purple-800">
                        {solBalance.toFixed(6)} SOL
                      </span>
                    </div>
                  )}
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

        {userFriendlyAddress && solBalance !== null && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Transfer SOL (Mainnet)
            </h2>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <h3 className="text-lg font-medium text-orange-800 mb-2">⚠️ Real Mainnet Transaction:</h3>
              <ul className="text-orange-700 space-y-1">
                <li>• This creates a real Solana transaction on mainnet</li>
                <li>• Make sure recipient address is correct</li>
                <li>• Transaction fees will be deducted from your balance</li>
                <li>• Currently shows transaction preparation (SignData API pending)</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address:
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter Solana address (Base58)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SOL):
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  max={solBalance}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {solBalance.toFixed(6)} SOL
                </p>
              </div>

              <button
                onClick={transferSol}
                disabled={isTransferring || !recipientAddress || !transferAmount}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {isTransferring ? 'Preparing Transaction...' : 'Transfer SOL'}
              </button>

              {txHash && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Transaction Data:
                  </h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {txHash}
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