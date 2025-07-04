import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Ed25519Program,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { SmartAccountInfo, OperationType, TransferParams, SwapParams, WithdrawParams } from '../types';
import bs58 from 'bs58';
import crypto from 'crypto';

export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;
  private payer: Keypair;
  private program: Program | null = null;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    
    this.programId = new PublicKey(process.env.PROGRAM_ID || '9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c');
    
    // Initialize payer from environment
    const payerSecretKey = process.env.PAYER_SECRET_KEY;
    if (!payerSecretKey) {
      throw new Error('PAYER_SECRET_KEY environment variable is required');
    }
    
    this.payer = Keypair.fromSecretKey(bs58.decode(payerSecretKey));
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      const version = await this.connection.getVersion();
      console.log('✅ Connected to Solana:', version);
      
      // Initialize Anchor program
      const wallet = new Wallet(this.payer);
      const provider = new AnchorProvider(this.connection, wallet, {
        commitment: 'confirmed',
      });
      
      // In a real implementation, you'd load the IDL
      // this.program = new Program(IDL, this.programId, provider);
      
      console.log('✅ Solana service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Solana service:', error);
      throw error;
    }
  }

  async createSmartAccount(tonPubkey: string, tonSignature: string): Promise<{ smartAccount: SmartAccountInfo; transactionSignature: string }> {
    try {
      const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
      const [smartAccountPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('smart_account'), tonPubkeyBytes],
        this.programId
      );

      // Check if account already exists
      const accountInfo = await this.connection.getAccountInfo(smartAccountPda);
      if (accountInfo) {
        throw new Error('Smart account already exists for this TON public key');
      }

      // Create Ed25519 verification instruction
      const ed25519Instruction = this.createEd25519Instruction(
        tonPubkey,
        tonSignature,
        this.createAccountMessage(tonPubkey)
      );

      // Create the smart account instruction
      const createAccountIx = new TransactionInstruction({
        keys: [
          { pubkey: smartAccountPda, isSigner: false, isWritable: true },
          { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          0, // create_account instruction discriminator
          ...tonPubkeyBytes,
          bump,
        ]),
      });

      const transaction = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ed25519Instruction)
        .add(createAccountIx);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer],
        { commitment: 'confirmed' }
      );

      const smartAccount: SmartAccountInfo = {
        address: smartAccountPda.toBase58(),
        tonPubkey,
        nonce: 0,
        createdAt: Date.now(),
        bump,
      };

      return { smartAccount, transactionSignature: signature };
    } catch (error) {
      console.error('Error creating smart account:', error);
      throw error;
    }
  }

  async getSmartAccountInfo(tonPubkey: string): Promise<SmartAccountInfo | null> {
    try {
      const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
      const [smartAccountPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('smart_account'), tonPubkeyBytes],
        this.programId
      );

      const accountInfo = await this.connection.getAccountInfo(smartAccountPda);
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      const data = accountInfo.data;
      const nonce = data.readBigUInt64LE(32); // After ton_pubkey
      const createdAt = data.readBigInt64LE(40); // After nonce
      const accountBump = data.readUInt8(48); // After created_at

      return {
        address: smartAccountPda.toBase58(),
        tonPubkey,
        nonce: Number(nonce),
        createdAt: Number(createdAt),
        bump: accountBump,
      };
    } catch (error) {
      console.error('Error getting smart account info:', error);
      return null;
    }
  }

  async executeTransfer(
    tonPubkey: string,
    params: TransferParams,
    nonce: number,
    timestamp: number,
    tonSignature: string
  ): Promise<string> {
    try {
      const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
      const [smartAccountPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('smart_account'), tonPubkeyBytes],
        this.programId
      );

      const destinationPubkey = new PublicKey(params.destination);
      
      // Create Ed25519 verification instruction
      const message = this.createOperationMessage(
        tonPubkey,
        OperationType.TRANSFER,
        params,
        nonce,
        timestamp
      );
      
      const ed25519Instruction = this.createEd25519Instruction(
        tonPubkey,
        tonSignature,
        message
      );

      // Create transfer instruction
      const transferIx = new TransactionInstruction({
        keys: [
          { pubkey: smartAccountPda, isSigner: false, isWritable: true },
          { pubkey: smartAccountPda, isSigner: false, isWritable: true }, // source_account
          { pubkey: destinationPubkey, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          1, // execute_transfer instruction discriminator
          ...new BN(params.amount).toArray('le', 8),
          ...new BN(nonce).toArray('le', 8),
          ...new BN(timestamp).toArray('le', 8),
          ...Buffer.from(tonSignature, 'hex'),
        ]),
      });

      const transaction = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ed25519Instruction)
        .add(transferIx);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer],
        { commitment: 'confirmed' }
      );

      return signature;
    } catch (error) {
      console.error('Error executing transfer:', error);
      throw error;
    }
  }

  async executeJupiterSwap(
    tonPubkey: string,
    params: SwapParams,
    nonce: number,
    timestamp: number,
    tonSignature: string
  ): Promise<string> {
    try {
      // This would integrate with Jupiter's API and program
      // For now, we'll just create a placeholder transaction
      
      const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
      const [smartAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('smart_account'), tonPubkeyBytes],
        this.programId
      );

      // Create Ed25519 verification instruction
      const message = this.createOperationMessage(
        tonPubkey,
        OperationType.JUPITER_SWAP,
        params,
        nonce,
        timestamp
      );
      
      const ed25519Instruction = this.createEd25519Instruction(
        tonPubkey,
        tonSignature,
        message
      );

      // Create Jupiter swap instruction
      const swapIx = new TransactionInstruction({
        keys: [
          { pubkey: smartAccountPda, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          2, // execute_jupiter_swap instruction discriminator
          ...new BN(params.amount).toArray('le', 8),
          ...new BN(0).toArray('le', 8), // minimum_amount_out
          ...new BN(nonce).toArray('le', 8),
          ...new BN(timestamp).toArray('le', 8),
          ...Buffer.from(tonSignature, 'hex'),
        ]),
      });

      const transaction = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ed25519Instruction)
        .add(swapIx);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer],
        { commitment: 'confirmed' }
      );

      return signature;
    } catch (error) {
      console.error('Error executing Jupiter swap:', error);
      throw error;
    }
  }

  async withdrawAll(
    tonPubkey: string,
    params: WithdrawParams,
    nonce: number,
    timestamp: number,
    tonSignature: string
  ): Promise<string> {
    try {
      const tonPubkeyBytes = Buffer.from(tonPubkey, 'hex');
      const [smartAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('smart_account'), tonPubkeyBytes],
        this.programId
      );

      const destinationPubkey = new PublicKey(params.destination);

      // Create Ed25519 verification instruction
      const message = this.createOperationMessage(
        tonPubkey,
        OperationType.WITHDRAW_ALL,
        params,
        nonce,
        timestamp
      );
      
      const ed25519Instruction = this.createEd25519Instruction(
        tonPubkey,
        tonSignature,
        message
      );

      // Create withdraw all instruction
      const withdrawIx = new TransactionInstruction({
        keys: [
          { pubkey: smartAccountPda, isSigner: false, isWritable: true },
          { pubkey: smartAccountPda, isSigner: false, isWritable: true }, // token_account
          { pubkey: destinationPubkey, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: Buffer.from([
          3, // withdraw_all instruction discriminator
          ...new BN(nonce).toArray('le', 8),
          ...new BN(timestamp).toArray('le', 8),
          ...Buffer.from(tonSignature, 'hex'),
        ]),
      });

      const transaction = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
        .add(ed25519Instruction)
        .add(withdrawIx);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer],
        { commitment: 'confirmed' }
      );

      return signature;
    } catch (error) {
      console.error('Error withdrawing all:', error);
      throw error;
    }
  }

  private createEd25519Instruction(
    tonPubkey: string,
    signature: string,
    message: string
  ): TransactionInstruction {
    const pubkeyBytes = Buffer.from(tonPubkey, 'hex');
    const signatureBytes = Buffer.from(signature, 'hex');
    const messageBytes = Buffer.from(message, 'utf8');

    return Ed25519Program.createInstructionWithPublicKey({
      publicKey: pubkeyBytes,
      message: messageBytes,
      signature: signatureBytes,
      instructionIndex: 0,
    });
  }

  private createAccountMessage(tonPubkey: string): string {
    return JSON.stringify({
      version: 1,
      chain: 'solana',
      program: this.programId.toBase58(),
      operation: 'create_account',
      tonPubkey,
      timestamp: Date.now(),
    });
  }

  private createOperationMessage(
    tonPubkey: string,
    operation: OperationType,
    params: any,
    nonce: number,
    timestamp: number
  ): string {
    const paramsHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex');

    return JSON.stringify({
      version: 1,
      chain: 'solana',
      program: this.programId.toBase58(),
      nonce,
      operation,
      paramsHash,
      timestamp,
      expiresAt: timestamp + 300000, // 5 minutes
    });
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  async getConnection(): Promise<Connection> {
    return this.connection;
  }
}