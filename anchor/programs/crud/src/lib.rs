#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod crud {
    use super::*;

  pub fn create_entry(ctx : Context<CreateEntry> , title : String ,message: String)->Result<()>{
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    

  }

  pub fn update_entry(ctx : Context<UpdateEntry> ,title :String , message : String )->Result<()>{
    msg!("Journal Entry Updated");
    msg!("Title: {}", title);
    msg!("New Message: {}", message);

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.message = message ; 
    Ok(())
  }

  pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Journal entry titled {} deleted", title);
        Ok(())
   }
  
}

// PDA
// define all the accounts 
#[derive(Accounts)] 
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info>{
  // Journal Accounts 
  #[account(
    init , // cause the account doesn't exist yet
    payer  =owner , 
    seeds = [title.as_bytes(), owner.key().as_ref()],
    space = 8  +  JournalEntrySpace::INIT_SPACE,
    bump
  )]
  pub journal_entry : Account<'info , JournalEntrySpace> , 
  #[account(mut)]
  pub owner  : Signer<'info>, 
  pub system_program: Program<'info, System>,


}


#[derive(Accounts)] // define all the accounts needed including system program that owns the PDA
#[instruction(title: String, message: String)]
pub struct UpdateEntry<'info>{
  // Journal Accounts 
  #[account(
    mut , // cause the account doesn't exist yet
    // payer  =owner , 
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump ,
    realloc = 8  +  JournalEntrySpace::INIT_SPACE,
    realloc:: payer = owner , 
    realloc::zero=true,
  )]


  pub journal_entry : Account<'info , JournalEntrySpace> , 
  #[account(mut)]
  pub owner  : Signer<'info>, 
  pub system_program: Program<'info, System>,


}
#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account( 
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close= owner,
    )]
    pub journal_entry: Account<'info, JournalEntrySpace>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// save journal data in an an account
#[account]
#[derive(InitSpace)]
pub struct JournalEntrySpace{
  pub owner : Pubkey, 
  #[max_len(50)]
  pub title : String , 
  #[max_len(50)]
  pub message   : String
}