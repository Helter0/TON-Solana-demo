import { Router, Request, Response } from 'express';
import { SolanaService } from '../services/solanaService';
import { RedisService } from '../services/redisService';
import { JupiterService } from '../services/jupiterService';
import { 
  PrepareOperationRequest, 
  PrepareOperationResponse, 
  ExecuteOperationRequest, 
  ExecuteOperationResponse, 
  OperationType,
  TransferParams,
  SwapParams,
  WithdrawParams,
  ErrorResponse 
} from '../types';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

const router = Router();

// Prepare operation for signing
router.post('/prepare', async (req: Request, res: Response) => {
  try {
    const { tonPubkey, operation, params }: PrepareOperationRequest = req.body;
    
    // Validate request
    if (!tonPubkey || !operation || !params) {
      return res.status(400).json({ 
        error: 'Missing required fields: tonPubkey, operation, params' 
      } as ErrorResponse);
    }

    // Validate TON public key format
    if (!/^[0-9a-fA-F]{64}$/.test(tonPubkey)) {
      return res.status(400).json({ 
        error: 'Invalid TON public key format' 
      } as ErrorResponse);
    }

    // Validate operation type
    if (!Object.values(OperationType).includes(operation)) {
      return res.status(400).json({ 
        error: 'Invalid operation type' 
      } as ErrorResponse);
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const redisService: RedisService = req.app.locals.redisService;
    const jupiterService = new JupiterService();

    // Check if account exists
    const accountInfo = await solanaService.getSmartAccountInfo(tonPubkey);
    if (!accountInfo) {
      return res.status(404).json({ 
        error: 'Smart account not found' 
      } as ErrorResponse);
    }

    // Validate operation-specific parameters
    const validationResult = await validateOperationParams(operation, params, jupiterService);
    if (!validationResult.valid) {
      return res.status(400).json({ 
        error: validationResult.error 
      } as ErrorResponse);
    }

    // Check rate limit
    const rateLimitKey = `prepare_operation:${tonPubkey}`;
    const rateLimitOk = await redisService.checkRateLimit(rateLimitKey, 10, 60); // 10 requests per minute
    
    if (!rateLimitOk) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      } as ErrorResponse);
    }

    // Generate operation ID
    const operationId = crypto.randomUUID();
    const timestamp = Date.now();
    const expiresAt = timestamp + 300000; // 5 minutes

    // Create message to sign
    const messageToSign = createSignatureMessage(
      tonPubkey,
      operation,
      params,
      accountInfo.nonce + 1,
      timestamp,
      expiresAt
    );

    // Store operation in Redis
    await redisService.storeOperation(operationId, {
      tonPubkey,
      operation,
      params,
      nonce: accountInfo.nonce + 1,
      timestamp,
      expiresAt,
      status: 'prepared',
    }, 300); // 5 minutes TTL

    const response: PrepareOperationResponse = {
      operationId,
      messageToSign,
      expiresAt,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Prepare operation error:', error);
    res.status(500).json({ 
      error: 'Failed to prepare operation',
      details: error.message 
    } as ErrorResponse);
  }
});

// Execute prepared operation
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { operationId, tonSignature }: ExecuteOperationRequest = req.body;
    
    // Validate request
    if (!operationId || !tonSignature) {
      return res.status(400).json({ 
        error: 'Missing required fields: operationId, tonSignature' 
      } as ErrorResponse);
    }

    // Validate signature format
    if (!/^[0-9a-fA-F]{128}$/.test(tonSignature)) {
      return res.status(400).json({ 
        error: 'Invalid signature format' 
      } as ErrorResponse);
    }

    const solanaService: SolanaService = req.app.locals.solanaService;
    const redisService: RedisService = req.app.locals.redisService;

    // Get operation from Redis
    const operation = await redisService.getOperation(operationId);
    if (!operation) {
      return res.status(404).json({ 
        error: 'Operation not found or expired' 
      } as ErrorResponse);
    }

    // Check if operation is already executed
    if (operation.status !== 'prepared') {
      return res.status(400).json({ 
        error: 'Operation already executed or invalid' 
      } as ErrorResponse);
    }

    // Check if operation has expired
    if (Date.now() > operation.expiresAt) {
      await redisService.deleteOperation(operationId);
      return res.status(400).json({ 
        error: 'Operation has expired' 
      } as ErrorResponse);
    }

    // Check rate limit
    const rateLimitKey = `execute_operation:${operation.tonPubkey}`;
    const rateLimitOk = await redisService.checkRateLimit(rateLimitKey, 5, 60); // 5 requests per minute
    
    if (!rateLimitOk) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      } as ErrorResponse);
    }

    // Execute the operation
    let transactionSignature: string;
    
    try {
      switch (operation.operation) {
        case OperationType.TRANSFER:
          transactionSignature = await solanaService.executeTransfer(
            operation.tonPubkey,
            operation.params as TransferParams,
            operation.nonce,
            operation.timestamp,
            tonSignature
          );
          break;
          
        case OperationType.JUPITER_SWAP:
          transactionSignature = await solanaService.executeJupiterSwap(
            operation.tonPubkey,
            operation.params as SwapParams,
            operation.nonce,
            operation.timestamp,
            tonSignature
          );
          break;
          
        case OperationType.WITHDRAW_ALL:
          transactionSignature = await solanaService.withdrawAll(
            operation.tonPubkey,
            operation.params as WithdrawParams,
            operation.nonce,
            operation.timestamp,
            tonSignature
          );
          break;
          
        default:
          throw new Error('Unsupported operation type');
      }

      // Update operation status
      operation.status = 'executed';
      operation.transactionSignature = transactionSignature;
      await redisService.storeOperation(operationId, operation, 3600); // Keep for 1 hour

      // Add to history
      await redisService.addOperationToHistory(operation.tonPubkey, {
        id: operationId,
        smartAccount: '', // Would be populated with actual smart account address
        operationType: operation.operation,
        amount: getOperationAmount(operation.operation, operation.params),
        nonce: operation.nonce,
        timestamp: operation.timestamp,
        signature: tonSignature,
        status: 'success',
        transactionSignature,
      });

      const response: ExecuteOperationResponse = {
        transactionSignature,
        operationId,
      };

      res.json(response);
    } catch (executionError: any) {
      console.error('Operation execution error:', executionError);
      
      // Update operation status to failed
      operation.status = 'failed';
      operation.errorMessage = executionError.message;
      await redisService.storeOperation(operationId, operation, 3600);

      // Add failed operation to history
      await redisService.addOperationToHistory(operation.tonPubkey, {
        id: operationId,
        smartAccount: '',
        operationType: operation.operation,
        amount: getOperationAmount(operation.operation, operation.params),
        nonce: operation.nonce,
        timestamp: operation.timestamp,
        signature: tonSignature,
        status: 'failed',
        errorMessage: executionError.message,
      });

      return res.status(500).json({ 
        error: 'Failed to execute operation',
        details: executionError.message 
      } as ErrorResponse);
    }
  } catch (error: any) {
    console.error('Execute operation error:', error);
    res.status(500).json({ 
      error: 'Failed to execute operation',
      details: error.message 
    } as ErrorResponse);
  }
});

// Get operation status
router.get('/:operationId', async (req: Request, res: Response) => {
  try {
    const { operationId } = req.params;
    
    if (!operationId) {
      return res.status(400).json({ 
        error: 'Operation ID is required' 
      } as ErrorResponse);
    }

    const redisService: RedisService = req.app.locals.redisService;
    const operation = await redisService.getOperation(operationId);
    
    if (!operation) {
      return res.status(404).json({ 
        error: 'Operation not found' 
      } as ErrorResponse);
    }

    // Remove sensitive data
    const { tonPubkey, ...publicOperation } = operation;
    
    res.json(publicOperation);
  } catch (error: any) {
    console.error('Get operation status error:', error);
    res.status(500).json({ 
      error: 'Failed to get operation status',
      details: error.message 
    } as ErrorResponse);
  }
});

// Helper functions
async function validateOperationParams(
  operation: OperationType,
  params: any,
  jupiterService: JupiterService
): Promise<{ valid: boolean; error?: string }> {
  switch (operation) {
    case OperationType.TRANSFER:
      return validateTransferParams(params);
    case OperationType.JUPITER_SWAP:
      return await validateSwapParams(params, jupiterService);
    case OperationType.WITHDRAW_ALL:
      return validateWithdrawParams(params);
    default:
      return { valid: false, error: 'Invalid operation type' };
  }
}

function validateTransferParams(params: TransferParams): { valid: boolean; error?: string } {
  if (!params.destination || !params.amount) {
    return { valid: false, error: 'Missing destination or amount' };
  }

  try {
    new PublicKey(params.destination);
  } catch {
    return { valid: false, error: 'Invalid destination address' };
  }

  if (params.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (params.tokenMint) {
    try {
      new PublicKey(params.tokenMint);
    } catch {
      return { valid: false, error: 'Invalid token mint address' };
    }
  }

  return { valid: true };
}

async function validateSwapParams(
  params: SwapParams,
  jupiterService: JupiterService
): Promise<{ valid: boolean; error?: string }> {
  if (!params.inputMint || !params.outputMint || !params.amount) {
    return { valid: false, error: 'Missing required swap parameters' };
  }

  if (params.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (params.slippage < 0 || params.slippage > 50) {
    return { valid: false, error: 'Slippage must be between 0 and 50 percent' };
  }

  // Validate with Jupiter service
  return await jupiterService.validateSwapParams(
    params.inputMint,
    params.outputMint,
    params.amount,
    params.slippage
  );
}

function validateWithdrawParams(params: WithdrawParams): { valid: boolean; error?: string } {
  if (!params.destination) {
    return { valid: false, error: 'Missing destination address' };
  }

  try {
    new PublicKey(params.destination);
  } catch {
    return { valid: false, error: 'Invalid destination address' };
  }

  if (params.tokenMint) {
    try {
      new PublicKey(params.tokenMint);
    } catch {
      return { valid: false, error: 'Invalid token mint address' };
    }
  }

  return { valid: true };
}

function createSignatureMessage(
  tonPubkey: string,
  operation: OperationType,
  params: any,
  nonce: number,
  timestamp: number,
  expiresAt: number
): string {
  const paramsHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');

  const message = {
    version: 1,
    chain: 'solana',
    program: process.env.PROGRAM_ID || '9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c',
    nonce,
    operation,
    paramsHash,
    timestamp,
    expiresAt,
  };

  return JSON.stringify(message);
}

function getOperationAmount(operation: OperationType, params: any): number {
  switch (operation) {
    case OperationType.TRANSFER:
      return (params as TransferParams).amount;
    case OperationType.JUPITER_SWAP:
      return (params as SwapParams).amount;
    case OperationType.WITHDRAW_ALL:
      return 0; // Will be determined at execution time
    default:
      return 0;
  }
}

export { router as operationRoutes };