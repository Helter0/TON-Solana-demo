import { PublicKey } from '@solana/web3.js';

// Program Constants
export const PROGRAM_ID = new PublicKey('9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c');

// Seeds for PDA derivation
export const SMART_ACCOUNT_SEED = 'smart_account';
export const OPERATION_RECORD_SEED = 'operation_record';

// Network Constants
export const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';
export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const JUPITER_API_V6 = 'https://quote-api.jup.ag/v6';

// TON Connect Constants
export const TON_CONNECT_MANIFEST_URL = 'https://ton-solana-wallet.com/tonconnect-manifest.json';

// Popular Token Mints on Solana
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  MNGO: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
  BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
  ETH: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  SAMO: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
} as const;

// Token Information
export const TOKEN_INFO = {
  [TOKEN_MINTS.SOL]: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  [TOKEN_MINTS.USDC]: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  [TOKEN_MINTS.USDT]: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
  },
  [TOKEN_MINTS.RAY]: {
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
} as const;

// Transaction Limits
export const TRANSACTION_LIMITS = {
  MAX_TRANSFER_AMOUNT: 1000000, // 1M tokens (in base units)
  MAX_SWAP_AMOUNT: 1000000,
  MAX_SLIPPAGE_BPS: 5000, // 50%
  MIN_SLIPPAGE_BPS: 1, // 0.01%
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5%
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  SIGNATURE_VALIDITY_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_MS: 60 * 1000, // 1 minute
  OPERATION_TTL_MS: 5 * 60 * 1000, // 5 minutes
  TRANSACTION_TIMEOUT_MS: 30 * 1000, // 30 seconds
} as const;

// Rate Limits
export const RATE_LIMITS = {
  CREATE_ACCOUNT: { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  PREPARE_OPERATION: { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  EXECUTE_OPERATION: { requests: 5, windowMs: 60 * 1000 }, // 5 per minute
  GET_BALANCE: { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
} as const;

// Instruction Discriminators (for Anchor program)
export const INSTRUCTION_DISCRIMINATORS = {
  CREATE_ACCOUNT: 0,
  EXECUTE_TRANSFER: 1,
  EXECUTE_JUPITER_SWAP: 2,
  WITHDRAW_ALL: 3,
} as const;

// Error Codes
export const ERROR_CODES = {
  INVALID_NONCE: 6000,
  INVALID_TIMESTAMP: 6001,
  ED25519_INSTRUCTION_NOT_FOUND: 6002,
  INVALID_SIGNATURE: 6003,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 4000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 500,
  ANIMATION_DURATION: 200,
} as const;

// Validation Constants
export const VALIDATION = {
  TON_PUBKEY_LENGTH: 64,
  TON_SIGNATURE_LENGTH: 128,
  SOLANA_ADDRESS_LENGTH: 44,
  MIN_AMOUNT: 0.000001,
  MAX_DECIMALS: 9,
} as const;

// Popular Trading Pairs
export const POPULAR_PAIRS = [
  { inputMint: TOKEN_MINTS.SOL, outputMint: TOKEN_MINTS.USDC, name: 'SOL/USDC' },
  { inputMint: TOKEN_MINTS.USDC, outputMint: TOKEN_MINTS.SOL, name: 'USDC/SOL' },
  { inputMint: TOKEN_MINTS.SOL, outputMint: TOKEN_MINTS.USDT, name: 'SOL/USDT' },
  { inputMint: TOKEN_MINTS.USDT, outputMint: TOKEN_MINTS.SOL, name: 'USDT/SOL' },
  { inputMint: TOKEN_MINTS.RAY, outputMint: TOKEN_MINTS.USDC, name: 'RAY/USDC' },
] as const;