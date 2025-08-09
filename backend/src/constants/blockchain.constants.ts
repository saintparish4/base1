export const SUPPORTED_CURRENCIES = {
  BTC: 'BTC',
  ETH: 'ETH',
  USD: 'USD',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const BLOCKCHAIN_NETWORKS = {
  BITCOIN_MAINNET: 'bitcoin-mainnet',
  BITCOIN_TESTNET: 'bitcoin-testnet',
  ETHEREUM_MAINNET: 'ethereum-mainnet',
  ETHEREUM_SEPOLIA: 'ethereum-sepolia',
} as const;

export const CONFIRMATION_REQUIREMENTS = {
  BTC: 6,
  ETH: 12,
} as const;

export const TRANSACTION_FEES = {
  BTC: {
    SLOW: 10, // sat/byte
    NORMAL: 20,
    FAST: 50,
  },
  ETH: {
    SLOW: 20, // gwei
    NORMAL: 40,
    FAST: 100,
  },
} as const;

