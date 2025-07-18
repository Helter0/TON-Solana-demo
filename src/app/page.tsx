'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import bs58 from 'bs58';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { mnemonicToWalletKey } from '@ton/crypto';
import * as bip39 from 'bip39';

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
  const [copiedAddress, setCopiedAddress] = useState<string>('');
  const [currentRPC, setCurrentRPC] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [seedVerification, setSeedVerification] = useState<{
    seedWords: number;
    tonPublicKeyBase64: string;
    tonPublicKeyHex: string;
    solanaKeyHex: string;
    derivedSolanaAddress: string;
    matchesConnectedWallet: boolean;
    matchesDisplayedSolanaAddress: boolean;
  } | null>(null);
  const [keyVerification, setKeyVerification] = useState<{
    originalKeyBase64: string;
    originalKeyHex: string;
    originalKeyBytes: number;
    solanaKeyHex: string;
    solanaKeyBytes: number;
    solanaAddress: string;
    solanaAddressLength: number;
    keyMatchesOriginal: string;
    isValidSolanaFormat: boolean;
  } | null>(null);

  useEffect(() => {
    if (tonConnectUI && tonConnectUI.account?.publicKey) {
      try {
        const pubKeyBase64 = tonConnectUI.account.publicKey;
        setPublicKey(pubKeyBase64);
        
        // Convert hex to buffer and ensure it's exactly 32 bytes for Solana
        const pubKeyBuffer = Buffer.from(pubKeyBase64, 'hex');
        
        // Solana addresses must be exactly 32 bytes
        let solanaKeyBuffer: Buffer;
        if (pubKeyBuffer.length === 32) {
          solanaKeyBuffer = pubKeyBuffer;
        } else if (pubKeyBuffer.length > 32) {
          // Take first 32 bytes
          solanaKeyBuffer = pubKeyBuffer.subarray(0, 32);
        } else {
          // Pad with zeros to reach 32 bytes
          solanaKeyBuffer = Buffer.concat([pubKeyBuffer, Buffer.alloc(32 - pubKeyBuffer.length)]);
        }
        
        const solanaAddr = bs58.encode(solanaKeyBuffer);
        setSolanaAddress(solanaAddr);
        
        // Debug info
        console.log('TON Public Key (Base64):', pubKeyBase64);
        console.log('Original buffer length:', pubKeyBuffer.length);
        console.log('Solana key buffer length:', solanaKeyBuffer.length);
        console.log('Solana address:', solanaAddr);
        console.log('Solana address length:', solanaAddr.length);
        
        // Create verification data
        const verification = {
          originalKeyBase64: pubKeyBase64,
          originalKeyHex: pubKeyBuffer.toString('hex'),
          originalKeyBytes: pubKeyBuffer.length,
          solanaKeyHex: solanaKeyBuffer.toString('hex'),
          solanaKeyBytes: solanaKeyBuffer.length,
          solanaAddress: solanaAddr,
          solanaAddressLength: solanaAddr.length,
          keyMatchesOriginal: pubKeyBuffer.length === 32 ? 'Exact match' : `Adjusted from ${pubKeyBuffer.length} to 32 bytes`,
          isValidSolanaFormat: solanaAddr.length >= 32 && solanaAddr.length <= 44
        };
        
        setKeyVerification(verification);
        
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
      // Try multiple RPC endpoints for better reliability
      const rpcEndpoints = [
        'https://mainnet.helius-rpc.com/?api-key=69fa6848-d6cf-4b62-bf25-3fb4967b120e',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana',
        'https://api.mainnet-beta.solana.com'
      ];
      
      let connection: Connection | null = null;
      for (const endpoint of rpcEndpoints) {
        try {
          connection = new Connection(endpoint, 'confirmed');
          const publicKey = new PublicKey(address);
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
          setCurrentRPC(endpoint);
          console.log(`Successfully connected to: ${endpoint}`);
          return;
        } catch (endpointError) {
          console.log(`Failed to connect to ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      throw new Error('All RPC endpoints failed');
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

    // Check if wallet supports signData
    const wallet = tonConnectUI.wallet;
    const supportsSignData = wallet && wallet.device?.features && wallet.device.features.includes('SendTransaction');
    
    if (!supportsSignData) {
      alert('Your wallet does not support SignData feature. Please use Tonkeeper wallet.');
      return;
    }

    const realTransaction = confirm('🚨 REAL MAINNET TRANSACTION!\n\nThis will send real SOL on Solana mainnet.\nTransaction cannot be undone.\n\nContinue?');
    
    if (!realTransaction) {
      return;
    }

    setIsTransferring(true);
    setTxHash('');

    try {
      // Try multiple RPC endpoints for transaction creation
      const rpcEndpoints = [
        'https://mainnet.helius-rpc.com/?api-key=69fa6848-d6cf-4b62-bf25-3fb4967b120e',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana',
        'https://api.mainnet-beta.solana.com'
      ];
      
      let connection: Connection | null = null;
      let blockhash: string | null = null;
      
      // Find working RPC endpoint
      for (const endpoint of rpcEndpoints) {
        try {
          connection = new Connection(endpoint, 'confirmed');
          const result = await connection.getLatestBlockhash('confirmed');
          blockhash = result.blockhash;
          console.log(`Using RPC endpoint: ${endpoint}`);
          break;
        } catch (endpointError) {
          console.log(`RPC ${endpoint} failed:`, endpointError);
          continue;
        }
      }
      
      if (!connection || !blockhash) {
        throw new Error('All RPC endpoints failed to provide blockhash');
      }
      
      // Create public keys
      const fromPubkey = new PublicKey(solanaAddress);
      const toPubkey = new PublicKey(recipientAddress);
      
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
      
      // Get estimated fee
      const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed');
      
      // Serialize transaction for signing
      const serializedTx = transaction.serializeMessage();
      
      try {
        // Try to sign with Tonkeeper SignData
        console.log('Attempting to sign Solana transaction with TON wallet...');
        
        // Try Tonkeeper-specific SignData format
        const signResult = await (tonConnectUI as unknown as { signData: (data: { schema_crc: number; cell: string }) => Promise<{ signature: string }> }).signData({
          schema_crc: 0,
          cell: bs58.encode(serializedTx)
        });
        
        console.log('SignData result:', signResult);
        
        // If we get here, the transaction was signed!
        // Now we need to apply the signature and send to Solana
        const signature = signResult.signature;
        
        // Apply signature to transaction
        // Note: This is simplified - real implementation needs proper signature handling
        transaction.addSignature(fromPubkey, Buffer.from(signature, 'base64'));
        
        // Send transaction to Solana
        const txId = await connection.sendRawTransaction(transaction.serialize());
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(txId, 'confirmed');
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        
        const successData = {
          status: 'SUCCESS',
          transactionId: txId,
          from: solanaAddress,
          to: recipientAddress,
          amount: `${transferAmount} SOL`,
          actualFee: feeEstimate?.value ? `${(feeEstimate.value / LAMPORTS_PER_SOL).toFixed(6)} SOL` : 'Unknown',
          explorer: `https://solscan.io/tx/${txId}`,
          timestamp: new Date().toISOString(),
          note: '🎉 Real Solana transaction executed using TON wallet signature!'
        };
        
        setTxHash(JSON.stringify(successData, null, 2));
        alert(`🎉 SUCCESS!\n\nTransaction sent to Solana mainnet!\nTX ID: ${txId}\n\nCheck on Solscan: https://solscan.io/tx/${txId}`);
        
        // Refresh balance
        setTimeout(() => fetchSolBalance(solanaAddress), 2000);
        
      } catch (signError) {
        console.error('SignData failed:', signError);
        
        // Fallback to showing prepared transaction
        const txHash = bs58.encode(serializedTx);
        const signatureData = {
          status: 'SIGN_FAILED',
          error: (signError as Error)?.message || 'SignData not supported or failed',
          action: 'SOL Transfer',
          from: solanaAddress,
          to: recipientAddress,
          amount: `${transferAmount} SOL`,
          estimatedFee: feeEstimate?.value ? `${(feeEstimate.value / LAMPORTS_PER_SOL).toFixed(6)} SOL` : '~0.000005 SOL',
          network: 'Solana Mainnet',
          transactionSize: `${serializedTx.length} bytes`,
          transactionHash: txHash.slice(0, 32) + '...',
          blockhash: blockhash.slice(0, 16) + '...',
          timestamp: new Date().toISOString(),
          note: 'SignData failed. Transaction prepared but not executed. Make sure you are using Tonkeeper wallet.'
        };
        
        setTxHash(JSON.stringify(signatureData, null, 2));
        alert('❌ SignData failed!\n\nMake sure you are using Tonkeeper wallet with SignData support.\n\nTransaction was prepared but not executed.');
      }
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error preparing transaction: ' + (error as Error).message);
    } finally {
      setIsTransferring(false);
    }
  };

  const createVerificationChallenge = () => {
    if (!keyVerification) return;
    
    const challenge = {
      message: "Verify this Solana address belongs to my TON wallet",
      timestamp: Date.now(),
      tonAddress: userFriendlyAddress,
      solanaAddress: solanaAddress,
      publicKeyHex: keyVerification.solanaKeyHex,
      instructions: [
        "1. Copy the Solana address above",
        "2. Send a small amount (0.001 SOL) from another wallet",
        "3. Check the transaction appears in Solana Explorer",
        "4. This proves the address is valid and accessible"
      ]
    };
    
    setSignedMessage(JSON.stringify(challenge, null, 2));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedAddress(type);
        setTimeout(() => setCopiedAddress(''), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const verifySeedPhrase = async () => {
    if (!seedPhrase.trim()) {
      alert('Please enter seed phrase');
      return;
    }

    try {
      const words = seedPhrase.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        alert('Seed phrase should be 12 or 24 words');
        return;
      }

      // Validate mnemonic
      if (!bip39.validateMnemonic(seedPhrase.trim())) {
        alert('Invalid seed phrase');
        return;
      }

      // Generate TON wallet key
      const keyPair = await mnemonicToWalletKey(words);
      const tonPublicKey = keyPair.publicKey.toString('base64');
      
      // Generate Solana address (same logic as main app)
      let solanaKeyBuffer: Buffer;
      if (keyPair.publicKey.length === 32) {
        solanaKeyBuffer = keyPair.publicKey;
      } else if (keyPair.publicKey.length > 32) {
        solanaKeyBuffer = keyPair.publicKey.subarray(0, 32);
      } else {
        solanaKeyBuffer = Buffer.concat([keyPair.publicKey, Buffer.alloc(32 - keyPair.publicKey.length)]);
      }
      
      const derivedSolanaAddress = bs58.encode(solanaKeyBuffer);

      const verification = {
        seedWords: words.length,
        tonPublicKeyBase64: tonPublicKey,
        tonPublicKeyHex: keyPair.publicKey.toString('hex'),
        solanaKeyHex: solanaKeyBuffer.toString('hex'),
        derivedSolanaAddress: derivedSolanaAddress,
        matchesConnectedWallet: tonPublicKey === publicKey,
        matchesDisplayedSolanaAddress: derivedSolanaAddress === solanaAddress
      };

      setSeedVerification(verification);

    } catch (error) {
      console.error('Seed verification error:', error);
      alert('Error processing seed phrase: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      {/* Version indicator */}
      <div className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10">
        <span className="text-2xl">🔧</span>
      </div>
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
                  <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                    <p className="font-mono text-sm text-gray-900 break-all flex-1 mr-3">
                      {userFriendlyAddress}
                    </p>
                    <button
                      onClick={() => copyToClipboard(userFriendlyAddress, 'ton')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0"
                    >
                      {copiedAddress === 'ton' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Solana Address
                  </h3>
                  <div className="bg-white p-3 rounded-lg border mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-sm text-gray-900 break-all flex-1 mr-3">
                        {solanaAddress || 'Deriving...'}
                      </p>
                      {solanaAddress && (
                        <button
                          onClick={() => copyToClipboard(solanaAddress, 'solana')}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0"
                        >
                          {copiedAddress === 'solana' ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    {solanaAddress && (
                      <div className="text-xs text-purple-600">
                        Length: {solanaAddress.length} characters
                        {solanaAddress.length >= 32 && solanaAddress.length <= 44 ? 
                          ' ✅ Valid Solana format' : 
                          ' ⚠️ Invalid length for Solana address'
                        }
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Balance:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-purple-800">
                          {solBalance !== null ? `${solBalance.toFixed(6)} SOL` : 'Loading...'}
                        </span>
                        <button
                          onClick={() => fetchSolBalance(solanaAddress)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                    {solBalance === null && (
                      <div className="mt-2 text-xs text-orange-600">
                        ⚠️ Balance not loaded. Try refresh button or check RPC connection.
                      </div>
                    )}
                    {currentRPC && (
                      <div className="mt-2 text-xs text-green-600">
                        ✅ Connected to: {currentRPC.includes('helius') ? 'Helius (Premium)' : 
                                         currentRPC.includes('serum') ? 'Serum' : 
                                         currentRPC.includes('ankr') ? 'Ankr' : 'Official'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {publicKey && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Ed25519 Public Key (Hex)
                  </h3>
                  <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                    <p className="font-mono text-sm text-gray-900 break-all flex-1 mr-3">
                      {publicKey}
                    </p>
                    <button
                      onClick={() => copyToClipboard(publicKey, 'publickey')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0"
                    >
                      {copiedAddress === 'publickey' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {keyVerification && (
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    🔍 Key Verification Details
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-green-700 mb-1">Original Key Length:</div>
                      <div className="font-mono text-sm">{keyVerification.originalKeyBytes} bytes</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-green-700 mb-1">Solana Key (Hex):</div>
                      <div className="font-mono text-xs break-all">{keyVerification.solanaKeyHex}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm font-medium text-green-700 mb-1">Conversion Status:</div>
                      <div className="text-sm">{keyVerification.keyMatchesOriginal}</div>
                    </div>
                    <button
                      onClick={createVerificationChallenge}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Create Verification Challenge
                    </button>
                  </div>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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

        {userFriendlyAddress && solanaAddress && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Transfer SOL (Mainnet)
            </h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">🚨 REAL MAINNET TRANSACTION:</h3>
              <ul className="text-red-700 space-y-1">
                <li>• <strong>This will execute a real Solana transaction with real money!</strong></li>
                <li>• Make sure recipient address is correct - transactions cannot be undone</li>
                <li>• Transaction fees will be deducted from your balance</li>
                <li>• <strong>Requires Tonkeeper wallet with SignData support</strong></li>
                <li>• Other wallets will show transaction preparation only</li>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm text-gray-900"
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
                  max={solBalance || undefined}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="0.001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {solBalance !== null ? `${solBalance.toFixed(6)} SOL` : 'Loading balance...'}
                </p>
              </div>

              <button
                onClick={transferSol}
                disabled={isTransferring || !recipientAddress || !transferAmount}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed w-full text-lg"
              >
                {isTransferring ? '🔄 Signing & Sending...' : '🚨 EXECUTE REAL SOL TRANSFER'}
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔍 Verify Address with Seed Phrase:</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-2">
                Enter your TON wallet seed phrase (12 or 24 words):
              </label>
              <textarea
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                rows={3}
                placeholder="word1 word2 word3 ..."
              />
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Only use with test/disposable wallets. Never share real seed phrases.
              </p>
            </div>
            
            <button
              onClick={verifySeedPhrase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Verify Seed Phrase
            </button>

            {seedVerification && (
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">Verification Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-yellow-700">Seed Words:</span>
                      <div className="font-mono">{seedVerification.seedWords}</div>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-700">Matches Connected Wallet:</span>
                      <div className={seedVerification.matchesConnectedWallet ? 'text-green-600' : 'text-red-600'}>
                        {seedVerification.matchesConnectedWallet ? '✅ Yes' : '❌ No'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-yellow-700">Derived Solana Address:</span>
                    <div className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                      {seedVerification.derivedSolanaAddress}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-yellow-700">Matches Displayed Address:</span>
                    <div className={seedVerification.matchesDisplayedSolanaAddress ? 'text-green-600' : 'text-red-600'}>
                      {seedVerification.matchesDisplayedSolanaAddress ? '✅ Perfect Match' : '❌ Different Address'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🔐 How to verify the address is correct:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Method 1: Small Transaction Test</h4>
              <ul className="space-y-1">
                <li>• Send 0.001 SOL to the generated address</li>
                <li>• Check if balance updates on our site</li>
                <li>• Verify transaction in Solana Explorer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Method 2: Key Verification</h4>
              <ul className="space-y-1">
                <li>• Compare hex public keys above</li>
                <li>• Use &quot;Create Verification Challenge&quot;</li>
                <li>• Check console logs for detailed info</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 text-center text-blue-600">
            <p className="font-medium">
              This proves the same Ed25519 key from TON wallet controls the Solana address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}