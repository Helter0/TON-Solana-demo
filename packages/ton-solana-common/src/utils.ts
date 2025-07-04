import { PublicKey } from '@solana/web3.js';
import { sha256 } from '@ton/crypto';
import bs58 from 'bs58';
import { 
  SignatureMessage, 
  OperationType, 
  OperationParams,
  PROGRAM_ID,
  SMART_ACCOUNT_SEED,
  VALIDATION,
  TIME_CONSTANTS
} from './index';

// Address Utilities
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return address.length === VALIDATION.SOLANA_ADDRESS_LENGTH;
  } catch {
    return false;
  }
}

export function isValidTonPublicKey(pubkey: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(pubkey) && pubkey.length === VALIDATION.TON_PUBKEY_LENGTH;
}

export function isValidTonSignature(signature: string): boolean {
  return /^[0-9a-fA-F]{128}$/.test(signature) && signature.length === VALIDATION.TON_SIGNATURE_LENGTH;
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// PDA Derivation
export function findSmartAccountPDA(tonPubkey: string): [PublicKey, number] {
  const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SMART_ACCOUNT_SEED), tonPubkeyBytes],
    PROGRAM_ID
  );
}

export function findOperationRecordPDA(smartAccount: PublicKey, nonce: number): [PublicKey, number] {
  const nonceBytes = Buffer.alloc(8);
  nonceBytes.writeBigUInt64LE(BigInt(nonce));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('operation_record'), smartAccount.toBytes(), nonceBytes],
    PROGRAM_ID
  );
}

// Signature Message Creation
export function createSignatureMessage(
  tonPubkey: string,
  operation: OperationType,
  params: OperationParams,
  nonce: number,
  timestamp: number,
  expiresAt?: number
): SignatureMessage {
  const paramsHash = createParamsHash(params);
  
  return {
    version: 1,
    chain: 'solana',
    program: PROGRAM_ID.toBase58(),
    nonce,
    operation,
    paramsHash,
    timestamp,
    expiresAt: expiresAt || timestamp + TIME_CONSTANTS.SIGNATURE_VALIDITY_MS,
  };
}

export function createParamsHash(params: OperationParams): string {
  const canonical = JSON.stringify(params, Object.keys(params).sort());
  return sha256(Buffer.from(canonical, 'utf8')).toString('hex');
}

export function serializeSignatureMessage(message: SignatureMessage): string {
  return JSON.stringify(message);
}

// Amount Formatting
export function formatTokenAmount(amount: number, decimals: number, precision: number = 6): string {
  const value = amount / Math.pow(10, decimals);
  
  if (value === 0) return '0';
  if (value < 0.000001) return '<0.000001';
  
  const formatted = value.toFixed(Math.min(precision, decimals));
  return parseFloat(formatted).toString();
}

export function parseTokenAmount(amount: string, decimals: number): number {
  const value = parseFloat(amount);
  if (isNaN(value) || value < 0) return 0;
  return Math.floor(value * Math.pow(10, decimals));
}

export function formatUsdValue(value: number): string {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

// Time Utilities
export function isTimestampValid(timestamp: number, validityMs: number = TIME_CONSTANTS.SIGNATURE_VALIDITY_MS): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= validityMs;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// Transaction Status Helpers
export function getTransactionExplorerUrl(signature: string, cluster: 'mainnet-beta' | 'devnet' = 'mainnet-beta'): string {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://solscan.io/tx'
    : 'https://solscan.io/tx?cluster=devnet';
  return `${baseUrl}/${signature}`;
}

export function getAccountExplorerUrl(address: string, cluster: 'mainnet-beta' | 'devnet' = 'mainnet-beta'): string {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://solscan.io/account'
    : 'https://solscan.io/account?cluster=devnet';
  return `${baseUrl}/${address}`;
}

// Validation Helpers
export function validateOperationParams(operation: OperationType, params: any): { valid: boolean; error?: string } {
  try {
    switch (operation) {
      case OperationType.TRANSFER:
        return validateTransferParams(params);
      case OperationType.JUPITER_SWAP:
        return validateSwapParams(params);
      case OperationType.WITHDRAW_ALL:
        return validateWithdrawParams(params);
      default:
        return { valid: false, error: 'Invalid operation type' };
    }
  } catch (error) {
    return { valid: false, error: 'Validation error' };
  }
}

function validateTransferParams(params: any): { valid: boolean; error?: string } {
  if (!params.destination || !params.amount) {
    return { valid: false, error: 'Missing destination or amount' };
  }
  
  if (!isValidSolanaAddress(params.destination)) {
    return { valid: false, error: 'Invalid destination address' };
  }
  
  if (typeof params.amount !== 'number' || params.amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (params.tokenMint && !isValidSolanaAddress(params.tokenMint)) {
    return { valid: false, error: 'Invalid token mint address' };
  }
  
  return { valid: true };
}

function validateSwapParams(params: any): { valid: boolean; error?: string } {
  if (!params.inputMint || !params.outputMint || !params.amount) {
    return { valid: false, error: 'Missing required swap parameters' };
  }
  
  if (!isValidSolanaAddress(params.inputMint) || !isValidSolanaAddress(params.outputMint)) {
    return { valid: false, error: 'Invalid mint addresses' };
  }
  
  if (typeof params.amount !== 'number' || params.amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (typeof params.slippage !== 'number' || params.slippage < 0 || params.slippage > 50) {
    return { valid: false, error: 'Invalid slippage (must be 0-50%)' };
  }
  
  return { valid: true };
}

function validateWithdrawParams(params: any): { valid: boolean; error?: string } {
  if (!params.destination) {
    return { valid: false, error: 'Missing destination address' };
  }
  
  if (!isValidSolanaAddress(params.destination)) {
    return { valid: false, error: 'Invalid destination address' };
  }
  
  if (params.tokenMint && !isValidSolanaAddress(params.tokenMint)) {
    return { valid: false, error: 'Invalid token mint address' };
  }
  
  return { valid: true };
}

// Error Handling
export function createErrorResponse(message: string, code?: string, details?: any): any {
  return {
    error: message,
    ...(code && { code }),
    ...(details && { details }),
  };
}

export function isErrorResponse(response: any): response is { error: string } {
  return response && typeof response.error === 'string';
}

// Debounce Utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Deep Clone Utility
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}

// Random ID Generation
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateOperationId(): string {
  return `op_${Date.now()}_${generateId()}`;
}