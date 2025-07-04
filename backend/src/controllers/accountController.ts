import { Router, Request, Response } from 'express';
import { SolanaService } from '../services/solanaService';
import { RedisService } from '../services/redisService';
import { 
  CreateAccountRequest, 
  CreateAccountResponse, 
  BalanceResponse, 
  ErrorResponse,
  TokenBalance 
} from '../types';
import { PublicKey } from '@solana/web3.js';

const router = Router();

// Create smart account
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { tonPubkey, tonSignature, timestamp }: CreateAccountRequest = req.body;
    
    // Validate request
    if (!tonPubkey || !tonSignature || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: tonPubkey, tonSignature, timestamp' 
      } as ErrorResponse);
    }

    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).json({ 
        error: 'Invalid TON public key format' 
      } as ErrorResponse);
    }

    // Validate signature format
    if (!/^[0-9a-fA-F]{128}$/.test(tonSignature)) {
      return res.status(400).json({ 
        error: 'Invalid signature format' 
      } as ErrorResponse);
    }

    // Validate timestamp (within 5 minutes)
    const currentTime = Date.now();
    if (Math.abs(currentTime - timestamp) > 300000) {
      return res.status(400).json({ 
        error: 'Timestamp too old or too far in the future' 
      } as ErrorResponse);
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const redisService: RedisService = req.app.locals.redisService;

    // Check rate limit
    const rateLimitKey = `create_account:${tonPubkey}`;
    const rateLimitOk = await redisService.checkRateLimit(rateLimitKey, 5, 3600); // 5 requests per hour
    
    if (!rateLimitOk) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      } as ErrorResponse);
    }

    // Create the smart account
    const result = await solanaService.createSmartAccount(tonPubkey, tonSignature);
    
    // Cache the account info
    await redisService.cacheAccountInfo(tonPubkey, result.smartAccount, 300);

    // Add creation to history
    await redisService.addOperationToHistory(tonPubkey, {
      id: result.transactionSignature,
      smartAccount: result.smartAccount.address,
      operationType: 'create',
      amount: 0,
      nonce: 0,
      timestamp: Date.now(),
      signature: tonSignature,
      status: 'success',
      transactionSignature: result.transactionSignature,
    });

    const response: CreateAccountResponse = {
      smartAccount: result.smartAccount,
      transactionSignature: result.transactionSignature,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Create account error:', error);
    
    if (error.message?.includes('already exists')) {
      return res.status(409).json({ 
        error: 'Smart account already exists for this TON public key' 
      } as ErrorResponse);
    }

    res.status(500).json({ 
      error: 'Failed to create smart account',
      details: error.message 
    } as ErrorResponse);
  }
});

// Get account info
router.get('/:tonPubkey', async (req: Request, res: Response) => {
  try {
    const { tonPubkey } = req.params;
    
    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).json({ 
        error: 'Invalid TON public key format' 
      } as ErrorResponse);
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const redisService: RedisService = req.app.locals.redisService;

    // Try to get from cache first
    let accountInfo = await redisService.getCachedAccountInfo(tonPubkey);
    
    if (!accountInfo) {
      // Get from blockchain
      accountInfo = await solanaService.getSmartAccountInfo(tonPubkey);
      
      if (!accountInfo) {
        return res.status(404).json({ 
          error: 'Smart account not found' 
        } as ErrorResponse);
      }

      // Cache for 1 minute
      await redisService.cacheAccountInfo(tonPubkey, accountInfo, 60);
    }

    res.json(accountInfo);
  } catch (error: any) {
    console.error('Get account info error:', error);
    res.status(500).json({ 
      error: 'Failed to get account info',
      details: error.message 
    } as ErrorResponse);
  }
});

// Get account balance
router.get('/:tonPubkey/balance', async (req: Request, res: Response) => {
  try {
    const { tonPubkey } = req.params;
    
    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).json({ 
        error: 'Invalid TON public key format' 
      } as ErrorResponse);
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const redisService: RedisService = req.app.locals.redisService;

    // Get account info first
    const accountInfo = await solanaService.getSmartAccountInfo(tonPubkey);
    
    if (!accountInfo) {
      return res.status(404).json({ 
        error: 'Smart account not found' 
      } as ErrorResponse);
    }

    // Get SOL balance
    const solBalance = await solanaService.getAccountBalance(accountInfo.address);
    
    // Get token balances (simplified - in real implementation would query token accounts)
    const tokenBalances: TokenBalance[] = [
      // This would be populated by querying actual token accounts
    ];

    const response: BalanceResponse = {
      solBalance,
      tokenBalances,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      error: 'Failed to get account balance',
      details: error.message 
    } as ErrorResponse);
  }
});

// Get operation history
router.get('/:tonPubkey/history', async (req: Request, res: Response) => {
  try {
    const { tonPubkey } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).json({ 
        error: 'Invalid TON public key format' 
      } as ErrorResponse);
    }

    const redisService: RedisService = req.app.locals.redisService;

    // Get operations from Redis
    const operations = await redisService.getOperationHistory(tonPubkey, page, limit);
    const total = await redisService.getOperationHistoryCount(tonPubkey);

    res.json({
      operations,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Failed to get operation history',
      details: error.message 
    } as ErrorResponse);
  }
});

// Check if account exists
router.head('/:tonPubkey', async (req: Request, res: Response) => {
  try {
    const { tonPubkey } = req.params;
    
    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).end();
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const accountInfo = await solanaService.getSmartAccountInfo(tonPubkey);
    
    if (accountInfo) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error: any) {
    console.error('Check account exists error:', error);
    res.status(500).end();
  }
});

export { router as accountRoutes };