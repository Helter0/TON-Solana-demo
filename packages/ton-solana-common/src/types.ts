import { PublicKey } from '@solana/web3.js';

// Base Types
export interface SmartAccountInfo {
  address: string;
  tonPubkey: string;
  nonce: number;
  createdAt: number;
  bump: number;
}

export interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
  logoUri?: string;
}

// Operation Types
export enum OperationType {
  CREATE_ACCOUNT = 'create_account',
  TRANSFER = 'transfer',
  JUPITER_SWAP = 'jupiter_swap',
  WITHDRAW_ALL = 'withdraw_all',
}

export interface TransferParams {
  destination: string;
  amount: number;
  tokenMint?: string;
}

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage: number;
  minimumAmountOut?: number;
}

export interface WithdrawParams {
  destination: string;
  tokenMint?: string;
}

export type OperationParams = TransferParams | SwapParams | WithdrawParams;

// Signature Message Format
export interface SignatureMessage {
  version: number;
  chain: 'solana';
  program: string;
  nonce: number;
  operation: OperationType;
  paramsHash: string;
  timestamp: number;
  expiresAt: number;
}

// API Request/Response Types
export interface CreateAccountRequest {
  tonPubkey: string;
  tonSignature: string;
  timestamp: number;
}

export interface CreateAccountResponse {
  smartAccount: SmartAccountInfo;
  transactionSignature: string;
}

export interface PrepareOperationRequest {
  tonPubkey: string;
  operation: OperationType;
  params: OperationParams;
}

export interface PrepareOperationResponse {
  operationId: string;
  messageToSign: string;
  expiresAt: number;
}

export interface ExecuteOperationRequest {
  operationId: string;
  tonSignature: string;
}

export interface ExecuteOperationResponse {
  transactionSignature: string;
  operationId: string;
}

export interface BalanceResponse {
  solBalance: number;
  tokenBalances: TokenBalance[];
}

export interface OperationHistoryResponse {
  operations: OperationRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface OperationRecord {
  id: string;
  smartAccount: string;
  operationType: OperationType;
  amount: number;
  nonce: number;
  timestamp: number;
  signature: string;
  status: 'pending' | 'success' | 'failed';
  transactionSignature?: string;
  errorMessage?: string;
}

// Jupiter Integration Types
export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null;
  priceImpactPct: string;
  routePlan: JupiterRoutePlan[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterRoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
}

// Error Types
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Solana Account Types
export interface SolanaAccountInfo {
  address: string;
  lamports: number;
  data: Buffer;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

export interface TokenAccountInfo {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
}

// Wallet State Types
export interface WalletState {
  isConnected: boolean;
  tonAddress: string | null;
  tonPublicKey: string | null;
  smartAccountAddress: string | null;
  smartAccountNonce: number;
  solBalance: number;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

// Configuration Types
export interface NetworkConfig {
  solanaRpcUrl: string;
  tonConnectManifestUrl: string;
  programId: string;
  jupiterApiUrl: string;
  backendApiUrl: string;
}

// Transaction Status Types
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface TransactionInfo {
  signature: string;
  status: TransactionStatus;
  blockTime?: number;
  confirmations: number;
  fee?: number;
  error?: string;
}

// Event Types for Real-time Updates
export interface AccountUpdateEvent {
  type: 'account_update';
  smartAccount: string;
  balance: number;
  nonce: number;
}

export interface TransactionEvent {
  type: 'transaction_update';
  signature: string;
  status: TransactionStatus;
  smartAccount: string;
}

export type WalletEvent = AccountUpdateEvent | TransactionEvent;