use anchor_lang::{AccountDeserialize, InstructionData};
use solana_program_test::{
    processor, tokio, BanksClientError, ProgramTest, ProgramTestContext,
};
use solana_sdk::{
    account::AccountSharedData,
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Keypair,
    signer::Signer,
    transaction::Transaction,
};
use time_locked_wallet::{self, ID};

#[tokio::test]
async fn test_create_wallet() {
    let mut validator = ProgramTest::default();
    validator.add_program(
        "time_locked_wallet",
        ID,
        processor!(time_locked_wallet::entry),
    );

    let owner = add_account(&mut validator);
    let mut context = validator.start_with_context().await;
    
    let (wallet_pda, _) = Pubkey::find_program_address(
        &[b"wallet", owner.pubkey().as_ref()],
        &ID,
    );

    // Verify wallet doesn't exist yet
    assert!(context
        .banks_client
        .get_account(wallet_pda)
        .await
        .unwrap()
        .is_none());

    // Create wallet
    let release_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64 + 5;
    
    create_wallet(&mut context, &owner, wallet_pda, release_time)
        .await
        .unwrap();

    // Verify wallet state
    let wallet_account = context
        .banks_client
        .get_account(wallet_pda)
        .await
        .unwrap()
        .unwrap();

    let wallet = time_locked_wallet::Wallet::try_deserialize(
        &mut wallet_account.data.as_ref(),
    )
    .unwrap();
    
    assert_eq!(wallet.owner, owner.pubkey());
    assert_eq!(wallet.release_time, release_time);
}

fn add_account(validator: &mut ProgramTest) -> Keypair {
    let keypair = Keypair::new();
    let account = AccountSharedData::new(
        1_000_000_000,
        0,
        &solana_sdk::system_program::id(),
    );
    validator.add_account(keypair.pubkey(), account.into());
    keypair
}

async fn create_wallet(
    context: &mut ProgramTestContext,
    owner: &Keypair,
    wallet_pda: Pubkey,
    release_time: i64,
) -> Result<(), BanksClientError> {
    let instruction = Instruction::new_with_bytes(
        ID,
        &time_locked_wallet::instruction::CreateWallet {
            release_time,
        }.data(),
        vec![
            AccountMeta::new(owner.pubkey(), true),
            AccountMeta::new(wallet_pda, false),
            AccountMeta::new_readonly(solana_sdk::system_program::id(), false),
        ],
    );

    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&owner.pubkey()),
        &vec![owner],
        context.banks_client.get_latest_blockhash().await?,
    );

    context.banks_client.process_transaction(transaction).await
}

#[tokio::test]
#[ignore = "TODO: Implement deposit test"]
async fn test_deposit() {
    todo!("Implement test for depositing funds into the time-locked wallet");
}

#[tokio::test]
#[ignore = "TODO: Implement withdraw test"]
async fn test_withdraw() {
    todo!("Implement test for withdrawing funds from the time-locked wallet");
}

#[tokio::test]
#[ignore = "TODO: Implement close test"]
async fn test_close_wallet() {
    todo!("Implement test for closing the time-locked wallet");
} 