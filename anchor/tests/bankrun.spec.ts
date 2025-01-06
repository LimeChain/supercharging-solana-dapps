// No imports needed: web3, anchor, pg and more are globally available
import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { Program } from "@coral-xyz/anchor";

import {
  startAnchor,
  Clock,
  BanksClient,
  ProgramTestContext,
} from "solana-bankrun";

import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

import IDL from "../target/idl/time_locked_wallet.json";
import { TimeLockedWallet } from "../target/types/time_locked_wallet";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("Time Locked Wallet Bankrun Tests", () => {
  let provider: BankrunProvider;
  let program: Program<TimeLockedWallet>;
  let banksClient: BanksClient;
  let context: ProgramTestContext;
  let owner: Keypair;
  let walletPDA: PublicKey;

  beforeAll(async () => {
    owner = new anchor.web3.Keypair();

    // Setup bankrun
    context = await startAnchor(
      "",
      [
        {
          name: "time_locked_wallet",
          programId: new PublicKey(IDL.address),
        },
      ],
      [
        {
          address: owner.publicKey,
          info: {
            lamports: 10 * LAMPORTS_PER_SOL,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    program = new Program<TimeLockedWallet>(IDL as TimeLockedWallet, provider);
    banksClient = context.banksClient;

    // Derive PDA for wallet
    [walletPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), owner.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Creates a time-locked wallet", async () => {
    const releaseTime = Math.floor(Date.now() / 1000) + 5;

    await program.methods
      .createWallet(new anchor.BN(releaseTime))
      .accounts({
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    const walletAccount = await program.account.wallet.fetch(walletPDA);
    expect(walletAccount.owner.toString()).toBe(owner.publicKey.toString());
    expect(walletAccount.releaseTime.toNumber()).toBe(releaseTime);
  });

  it("Deposits SOL and tests time lock", async () => {
    const depositAmount = new anchor.BN(LAMPORTS_PER_SOL);
    const initialBalance = await banksClient.getBalance(walletPDA);

    // Deposit
    await program.methods
      .deposit(depositAmount)
      .accounts({
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    // Verify deposit
    const afterDepositBalance = await banksClient.getBalance(walletPDA);
    expect(Number(afterDepositBalance - initialBalance)).toBe(LAMPORTS_PER_SOL);

    // Advance clock
    const currentClock = await banksClient.getClock();
    const futureTime = BigInt(Math.floor(Date.now() / 1000) + 100);
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        futureTime
      )
    );

    // Withdraw with all required accounts
    await program.methods
      .withdraw()
      .accounts({
        wallet: walletPDA,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    // Verify withdrawal
    const finalBalance = await banksClient.getBalance(walletPDA);
    expect(Number(finalBalance)).toBeLessThan(Number(afterDepositBalance));
  });

  it("Can close the wallet", async () => {
    // Get initial balances
    const initialOwnerBalance = await banksClient.getBalance(owner.publicKey);
    const initialWalletBalance = await banksClient.getBalance(walletPDA);

    // Close the wallet
    await program.methods
      .closeWallet()
      .accounts({
        wallet: walletPDA,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    // Verify account is closed
    const walletAccount = await banksClient.getAccount(walletPDA);
    expect(walletAccount).toBeNull();

    // Verify owner received rent
    const finalOwnerBalance = await banksClient.getBalance(owner.publicKey);
    expect(Number(finalOwnerBalance)).toBeGreaterThan(
      Number(initialOwnerBalance)
    );
    expect(Number(finalOwnerBalance - initialOwnerBalance)).toBe(
      Number(initialWalletBalance)
    );
  });
});
