import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeLockedWallet } from "../target/types/time_locked_wallet";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("time_locked_wallet", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .time_locked_wallet as Program<TimeLockedWallet>;
  const wallet = anchor.AnchorProvider.env().wallet;

  const getWalletPDA = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), owner.toBuffer()],
      program.programId
    )[0];
  };

  it("Creates a time-locked wallet", async () => {
    const releaseTime = Math.floor(Date.now() / 1000) + 5; // 5 seconds from now
    const walletPDA = getWalletPDA(wallet.publicKey);

    const tx = await program.methods
      .createWallet(new anchor.BN(releaseTime))
      .accounts({
        owner: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const walletAccount = await program.account.wallet.fetch(walletPDA);
    expect(walletAccount.owner.toString()).toBe(wallet.publicKey.toString());
    expect(walletAccount.releaseTime.toNumber()).toBe(releaseTime);
  });

  it("Deposits SOL into the wallet", async () => {
    const walletPDA = getWalletPDA(wallet.publicKey);
    const depositAmount = LAMPORTS_PER_SOL; // 1 SOL

    const beforeBalance = await program.provider.connection.getBalance(
      walletPDA
    );

    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        owner: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const afterBalance = await program.provider.connection.getBalance(
      walletPDA
    );
    expect(afterBalance - beforeBalance).toBe(depositAmount);
  });

  it("Fails to withdraw before release time", async () => {
    const walletPDA = getWalletPDA(wallet.publicKey);

    await expect(
      program.methods
        .withdraw()
        .accounts({
          wallet: walletPDA,
        })
        .rpc()
    ).rejects.toThrow("TooEarly");
  });

  it("Withdraws after release time", async () => {
    // Wait for the time lock to expire
    await new Promise((resolve) => setTimeout(resolve, 7000));

    const walletPDA = getWalletPDA(wallet.publicKey);
    const beforeBalance = await program.provider.connection.getBalance(
      wallet.publicKey
    );

    const tx = await program.methods
      .withdraw()
      .accounts({
        wallet: walletPDA,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const afterBalance = await program.provider.connection.getBalance(
      wallet.publicKey
    );
    const walletBalance = await program.provider.connection.getBalance(
      walletPDA
    );

    expect(afterBalance).toBeGreaterThan(beforeBalance);
    expect(walletBalance).toBeGreaterThan(0);
  }, 10000); // Added 10 second timeout here

  it("Closes the wallet", async () => {
    const walletPDA = getWalletPDA(wallet.publicKey);

    const tx = await program.methods
      .closeWallet()
      .accounts({
        wallet: walletPDA,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const walletAccount = await program.provider.connection.getAccountInfo(
      walletPDA
    );
    expect(walletAccount).toBeNull();
  });
});
