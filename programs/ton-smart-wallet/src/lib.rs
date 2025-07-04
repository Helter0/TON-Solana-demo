use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use solana_program::{
    ed25519_program::ID as ED25519_PROGRAM_ID,
    instruction::Instruction,
    program::invoke,
    sysvar::instructions::{self, Instructions},
};

declare_id!("9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c");

#[program]
pub mod ton_smart_wallet {
    use super::*;

    pub fn create_account(
        ctx: Context<CreateAccount>,
        ton_pubkey: [u8; 32],
        bump: u8,
    ) -> Result<()> {
        let smart_account = &mut ctx.accounts.smart_account;
        smart_account.ton_pubkey = ton_pubkey;
        smart_account.nonce = 0;
        smart_account.created_at = Clock::get()?.unix_timestamp;
        smart_account.bump = bump;
        
        emit!(SmartAccountCreated {
            smart_account: smart_account.key(),
            ton_pubkey,
            created_at: smart_account.created_at,
        });
        
        Ok(())
    }

    pub fn execute_transfer(
        ctx: Context<ExecuteTransfer>,
        amount: u64,
        nonce: u64,
        timestamp: i64,
        ton_signature: [u8; 64],
    ) -> Result<()> {
        let smart_account = &mut ctx.accounts.smart_account;
        
        // Verify nonce
        require!(nonce == smart_account.nonce + 1, ErrorCode::InvalidNonce);
        
        // Verify timestamp (5 minutes window)
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            (current_time - timestamp).abs() < 300,
            ErrorCode::InvalidTimestamp
        );
        
        // Verify TON signature
        verify_ton_signature(
            &ctx.accounts.instructions,
            &smart_account.ton_pubkey,
            nonce,
            timestamp,
            amount,
            &ton_signature,
        )?;
        
        // Execute transfer
        let transfer_instruction = Transfer {
            from: ctx.accounts.source_account.to_account_info(),
            to: ctx.accounts.destination_account.to_account_info(),
            authority: ctx.accounts.smart_account.to_account_info(),
        };
        
        let seeds = &[
            b"smart_account",
            &smart_account.ton_pubkey,
            &[smart_account.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        // Update nonce
        smart_account.nonce = nonce;
        
        // Log operation
        emit!(TransferExecuted {
            smart_account: smart_account.key(),
            destination: ctx.accounts.destination_account.key(),
            amount,
            nonce,
            timestamp,
        });
        
        Ok(())
    }

    pub fn execute_jupiter_swap(
        ctx: Context<ExecuteJupiterSwap>,
        amount_in: u64,
        minimum_amount_out: u64,
        nonce: u64,
        timestamp: i64,
        ton_signature: [u8; 64],
    ) -> Result<()> {
        let smart_account = &mut ctx.accounts.smart_account;
        
        // Verify nonce and timestamp
        require!(nonce == smart_account.nonce + 1, ErrorCode::InvalidNonce);
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            (current_time - timestamp).abs() < 300,
            ErrorCode::InvalidTimestamp
        );
        
        // Verify TON signature
        verify_ton_signature(
            &ctx.accounts.instructions,
            &smart_account.ton_pubkey,
            nonce,
            timestamp,
            amount_in,
            &ton_signature,
        )?;
        
        // Execute Jupiter swap through CPI
        // This would integrate with Jupiter's program
        // For now, we'll just emit an event
        
        smart_account.nonce = nonce;
        
        emit!(JupiterSwapExecuted {
            smart_account: smart_account.key(),
            amount_in,
            minimum_amount_out,
            nonce,
            timestamp,
        });
        
        Ok(())
    }

    pub fn withdraw_all(
        ctx: Context<WithdrawAll>,
        nonce: u64,
        timestamp: i64,
        ton_signature: [u8; 64],
    ) -> Result<()> {
        let smart_account = &mut ctx.accounts.smart_account;
        
        // Verify nonce and timestamp
        require!(nonce == smart_account.nonce + 1, ErrorCode::InvalidNonce);
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            (current_time - timestamp).abs() < 300,
            ErrorCode::InvalidTimestamp
        );
        
        // Verify TON signature
        verify_ton_signature(
            &ctx.accounts.instructions,
            &smart_account.ton_pubkey,
            nonce,
            timestamp,
            0, // amount is not relevant for withdraw_all
            &ton_signature,
        )?;
        
        // Get account balance
        let balance = ctx.accounts.token_account.amount;
        
        // Transfer all tokens to destination
        let transfer_instruction = Transfer {
            from: ctx.accounts.token_account.to_account_info(),
            to: ctx.accounts.destination_account.to_account_info(),
            authority: ctx.accounts.smart_account.to_account_info(),
        };
        
        let seeds = &[
            b"smart_account",
            &smart_account.ton_pubkey,
            &[smart_account.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, balance)?;
        
        smart_account.nonce = nonce;
        
        emit!(WithdrawAllExecuted {
            smart_account: smart_account.key(),
            destination: ctx.accounts.destination_account.key(),
            amount: balance,
            nonce,
            timestamp,
        });
        
        Ok(())
    }
}

fn verify_ton_signature(
    instructions_sysvar: &AccountInfo,
    ton_pubkey: &[u8; 32],
    nonce: u64,
    timestamp: i64,
    amount: u64,
    signature: &[u8; 64],
) -> Result<()> {
    // Load the current instruction
    let instructions = Instructions::load(instructions_sysvar)?;
    
    // Find the Ed25519 verification instruction
    let mut ed25519_ix_found = false;
    for i in 0..instructions.len() {
        if let Ok(instruction) = instructions.get(i) {
            if instruction.program_id == ED25519_PROGRAM_ID {
                ed25519_ix_found = true;
                break;
            }
        }
    }
    
    require!(ed25519_ix_found, ErrorCode::Ed25519InstructionNotFound);
    
    // In a real implementation, you would verify that the Ed25519 instruction
    // contains the correct message hash and signature
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(ton_pubkey: [u8; 32], bump: u8)]
pub struct CreateAccount<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + SmartAccount::LEN,
        seeds = [b"smart_account", &ton_pubkey],
        bump
    )]
    pub smart_account: Account<'info, SmartAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    #[account(
        mut,
        seeds = [b"smart_account", &smart_account.ton_pubkey],
        bump = smart_account.bump
    )]
    pub smart_account: Account<'info, SmartAccount>,
    #[account(mut)]
    pub source_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the sysvar for instructions
    #[account(address = instructions::ID)]
    pub instructions: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ExecuteJupiterSwap<'info> {
    #[account(
        mut,
        seeds = [b"smart_account", &smart_account.ton_pubkey],
        bump = smart_account.bump
    )]
    pub smart_account: Account<'info, SmartAccount>,
    /// CHECK: This is the sysvar for instructions
    #[account(address = instructions::ID)]
    pub instructions: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct WithdrawAll<'info> {
    #[account(
        mut,
        seeds = [b"smart_account", &smart_account.ton_pubkey],
        bump = smart_account.bump
    )]
    pub smart_account: Account<'info, SmartAccount>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the sysvar for instructions
    #[account(address = instructions::ID)]
    pub instructions: UncheckedAccount<'info>,
}

#[account]
pub struct SmartAccount {
    pub ton_pubkey: [u8; 32],
    pub nonce: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl SmartAccount {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct OperationRecord {
    pub smart_account: Pubkey,
    pub operation_type: OperationType,
    pub amount: u64,
    pub nonce: u64,
    pub timestamp: i64,
    pub signature: [u8; 64],
}

impl OperationRecord {
    pub const LEN: usize = 32 + 1 + 8 + 8 + 8 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OperationType {
    Transfer,
    JupiterSwap,
    WithdrawAll,
}

#[event]
pub struct SmartAccountCreated {
    pub smart_account: Pubkey,
    pub ton_pubkey: [u8; 32],
    pub created_at: i64,
}

#[event]
pub struct TransferExecuted {
    pub smart_account: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub nonce: u64,
    pub timestamp: i64,
}

#[event]
pub struct JupiterSwapExecuted {
    pub smart_account: Pubkey,
    pub amount_in: u64,
    pub minimum_amount_out: u64,
    pub nonce: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawAllExecuted {
    pub smart_account: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub nonce: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid nonce")]
    InvalidNonce,
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    #[msg("Ed25519 instruction not found")]
    Ed25519InstructionNotFound,
    #[msg("Invalid signature")]
    InvalidSignature,
}