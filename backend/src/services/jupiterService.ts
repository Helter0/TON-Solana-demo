import axios from 'axios';
import { JupiterQuoteResponse, JupiterSwapResponse } from '../types';

export class JupiterService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuoteResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: amount.toString(),
          slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Jupiter quote error:', error);
      throw new Error('Failed to get Jupiter quote');
    }
  }

  async getSwapTransaction(
    quote: JupiterQuoteResponse,
    userPublicKey: string,
    wrapAndUnwrapSol: boolean = true
  ): Promise<JupiterSwapResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/swap`, {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol,
        computeUnitPriceMicroLamports: 'auto',
        asLegacyTransaction: false,
      });

      return response.data;
    } catch (error) {
      console.error('Jupiter swap error:', error);
      throw new Error('Failed to get Jupiter swap transaction');
    }
  }

  async getTokenList(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tokens`);
      return response.data;
    } catch (error) {
      console.error('Jupiter token list error:', error);
      return [];
    }
  }

  async getPrice(ids: string[]): Promise<Record<string, { price: number }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: {
          ids: ids.join(','),
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Jupiter price error:', error);
      return {};
    }
  }

  async getSwapHistory(wallet: string, limit: number = 10): Promise<any[]> {
    try {
      // This would use Jupiter's API or on-chain data
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Jupiter swap history error:', error);
      return [];
    }
  }

  async validateSwapParams(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippage: number
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Validate input mint
      if (!inputMint || inputMint.length !== 44) {
        return { valid: false, error: 'Invalid input mint address' };
      }

      // Validate output mint
      if (!outputMint || outputMint.length !== 44) {
        return { valid: false, error: 'Invalid output mint address' };
      }

      // Validate amount
      if (amount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
      }

      // Validate slippage
      if (slippage < 0 || slippage > 50) {
        return { valid: false, error: 'Slippage must be between 0 and 50 percent' };
      }

      // Try to get a quote to validate the swap is possible
      const quote = await this.getQuote(inputMint, outputMint, amount, slippage * 100);
      
      if (!quote.outAmount || quote.outAmount === '0') {
        return { valid: false, error: 'No liquidity available for this swap' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to validate swap parameters' };
    }
  }

  calculatePriceImpact(quote: JupiterQuoteResponse): number {
    return parseFloat(quote.priceImpactPct || '0');
  }

  calculateMinimumReceived(quote: JupiterQuoteResponse, slippageBps: number): number {
    const outputAmount = parseInt(quote.outAmount);
    const slippageMultiplier = (10000 - slippageBps) / 10000;
    return Math.floor(outputAmount * slippageMultiplier);
  }

  formatTokenAmount(amount: string, decimals: number): number {
    return parseInt(amount) / Math.pow(10, decimals);
  }

  formatTokenAmountForDisplay(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals > 6 ? 6 : decimals);
  }

  // Helper method to get popular token pairs
  getPopularTokenPairs(): Array<{ inputMint: string; outputMint: string; name: string }> {
    return [
      {
        inputMint: 'So11111111111111111111111111111111111111112', // SOL
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        name: 'SOL → USDC',
      },
      {
        inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        outputMint: 'So11111111111111111111111111111111111111112', // SOL
        name: 'USDC → SOL',
      },
      {
        inputMint: 'So11111111111111111111111111111111111111112', // SOL
        outputMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        name: 'SOL → USDT',
      },
      {
        inputMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        outputMint: 'So11111111111111111111111111111111111111112', // SOL
        name: 'USDT → SOL',
      },
    ];
  }
}