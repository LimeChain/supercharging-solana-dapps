use anchor_lang::prelude::*;

declare_id!("HyhjkEEXwfRrjupW2Bq4ALpGPe2fEDTDuPKK2HVFFn6m");

#[program]
pub mod time_locked_wallet {
    use super::*;

    pub fn create_wallet(ctx: Context<CreateWallet>, release_time: i64) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = ctx.accounts.owner.key();
        wallet.release_time = release_time;
        wallet.bump = ctx.bumps.wallet;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // Transfer SOL from owner to wallet account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        
        if current_time < ctx.accounts.wallet.release_time {
            return err!(ErrorCode::TooEarly);
        }

        // Get the wallet's balance
        let wallet_balance = ctx.accounts.wallet.to_account_info().lamports();
        
        // Leave enough SOL for rent-exemption
        let rent = Rent::get()?.minimum_balance(ctx.accounts.wallet.to_account_info().data_len());
        let withdraw_amount = wallet_balance.checked_sub(rent).unwrap_or(0);

        // Transfer all SOL except rent from wallet to owner
        **ctx.accounts.wallet.to_account_info().try_borrow_mut_lamports()? = rent;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += withdraw_amount;

        Ok(())
    }

    pub fn close_wallet(_ctx: Context<CloseWallet>) -> Result<()> {
        // The close = owner constraint will handle returning the rent
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateWallet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 1,
        seeds = [b"wallet", owner.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, Wallet>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"wallet", owner.key().as_ref()],
        bump = wallet.bump,
        has_one = owner
    )]
    pub wallet: Account<'info, Wallet>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = owner)]
    pub wallet: Account<'info, Wallet>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseWallet<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub wallet: Account<'info, Wallet>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct Wallet {
    pub owner: Pubkey,
    pub release_time: i64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("It's too early to withdraw.")]
    TooEarly,
}
