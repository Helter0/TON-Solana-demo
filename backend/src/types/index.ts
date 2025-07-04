export interface SmartAccountInfo {
  address: string;
  tonPubkey: string;
  nonce: number;
  createdAt: number;
  bump: number;
}

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

export interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
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

export enum OperationType {
  TRANSFER = 'transfer',
  JUPITER_SWAP = 'swap',
  WITHDRAW_ALL = 'withdraw'
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
}

export interface WithdrawParams {
  destination: string;
  tokenMint?: string;
}

export type OperationParams = TransferParams | SwapParams | WithdrawParams;

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
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
}

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

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}