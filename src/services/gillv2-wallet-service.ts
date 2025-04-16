import {
  debug,
  getExplorerLink,
  createTransaction,
  LAMPORTS_PER_SOL,
} from "gill";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { TIME_LOCKED_WALLET_PROGRAM_ID } from "../../anchor/src/time-locked-wallet-exports";
import { useGillClient } from "../hooks/useGillClient";

// Enable Gill debug mode in development environment
if (process.env.NODE_ENV === "development") {
  window.__GILL_DEBUG__ = true;
}

/**
 * Derive PDA for the wallet account
 */
export const deriveWalletAddress = (owner: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("wallet"), owner.toBuffer()],
    TIME_LOCKED_WALLET_PROGRAM_ID
  );
};

/**
 * Hook that provides Gill-based interactions with the Time-Locked Wallet program
 */
export function useGillTimeLockedWallet() {
  const { publicKey, signTransaction } = useWallet();
  const { rpc, sendAndConfirmTransaction } = useGillClient("devnet");

  /**
   * Create a new Time-Locked Wallet on-chain
   */
  const createWallet = useCallback(
    async (releaseTime: number) => {
      if (!publicKey || !signTransaction) {
        toast.error("Wallet not connected");
        return null;
      }

      try {
        toast.loading("Creating wallet...");
        debug("Creating wallet with release time: " + releaseTime);

        // Get latest blockhash for the transaction
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send();

        // Derive wallet PDA
        const [walletPda] = deriveWalletAddress(publicKey);

        // Create instruction data for create_wallet
        const data = Buffer.concat([
          Buffer.from([0]), // Instruction index for create_wallet
          Buffer.from(
            new Uint8Array(new BigInt64Array([BigInt(releaseTime)]).buffer)
          ),
        ]);

        // Create transaction using Gill's createTransaction
        const tx = createTransaction({
          version: "legacy",
          feePayer: publicKey,
          instructions: [
            {
              programId: TIME_LOCKED_WALLET_PROGRAM_ID,
              keys: [
                { pubkey: publicKey, isSigner: true, isWritable: true },
                { pubkey: walletPda, isSigner: false, isWritable: true },
                {
                  pubkey: new PublicKey("11111111111111111111111111111111"), // System Program
                  isSigner: false,
                  isWritable: false,
                },
              ],
              data,
            },
          ],
          latestBlockhash: latestBlockhash.blockhash,
        });

        // Sign with wallet adapter
        const signedTx = await signTransaction(tx);

        // Get explorer link using Gill's utility
        const signatureBytes = signedTx.signatures[0].signature;
        if (!signatureBytes) {
          toast.dismiss();
          toast.error("Failed to sign transaction");
          return null;
        }

        const signature = Buffer.from(signatureBytes).toString("hex");
        const explorerLink = getExplorerLink({
          cluster: "devnet",
          transaction: signature,
        });

        debug("Transaction explorer link: " + explorerLink);

        // Send and confirm transaction
        await sendAndConfirmTransaction(signedTx);

        toast.dismiss();
        toast.success("Wallet created successfully!");
        return { walletAddress: walletPda, signature, explorerLink };
      } catch (error) {
        console.error("Error creating wallet:", error);
        toast.dismiss();
        toast.error(`Failed to create wallet: ${error.message || error}`);
        return null;
      }
    },
    [publicKey, signTransaction, rpc, sendAndConfirmTransaction]
  );

  /**
   * Deposit SOL into the Time-Locked Wallet
   */
  const deposit = useCallback(
    async (amount: number) => {
      if (!publicKey || !signTransaction) {
        toast.error("Wallet not connected");
        return null;
      }

      try {
        toast.loading("Depositing funds...");
        debug(`Depositing ${amount / LAMPORTS_PER_SOL} SOL to wallet`);

        // Get latest blockhash for the transaction
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send();

        // Derive wallet PDA
        const [walletPda] = deriveWalletAddress(publicKey);

        // Create instruction data for deposit
        const data = Buffer.concat([
          Buffer.from([1]), // Instruction index for deposit
          Buffer.from(
            new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer)
          ),
        ]);

        // Create transaction using Gill's createTransaction
        const tx = createTransaction({
          version: "legacy",
          feePayer: publicKey,
          instructions: [
            {
              programId: TIME_LOCKED_WALLET_PROGRAM_ID,
              keys: [
                { pubkey: publicKey, isSigner: true, isWritable: true },
                { pubkey: walletPda, isSigner: false, isWritable: true },
                {
                  pubkey: new PublicKey("11111111111111111111111111111111"), // System Program
                  isSigner: false,
                  isWritable: false,
                },
              ],
              data,
            },
          ],
          latestBlockhash: latestBlockhash.blockhash,
        });

        // Sign with wallet adapter
        const signedTx = await signTransaction(tx);

        // Get explorer link
        const signatureBytes = signedTx.signatures[0].signature;
        if (!signatureBytes) {
          toast.dismiss();
          toast.error("Failed to sign transaction");
          return null;
        }

        const signature = Buffer.from(signatureBytes).toString("hex");
        const explorerLink = getExplorerLink({
          cluster: "devnet",
          transaction: signature,
        });

        debug("Transaction explorer link: " + explorerLink);

        // Send and confirm transaction
        await sendAndConfirmTransaction(signedTx);

        toast.dismiss();
        toast.success("Funds deposited successfully!");
        return { signature, explorerLink };
      } catch (error) {
        console.error("Error depositing funds:", error);
        toast.dismiss();
        toast.error(`Failed to deposit funds: ${error.message || error}`);
        return null;
      }
    },
    [publicKey, signTransaction, rpc, sendAndConfirmTransaction]
  );

  /**
   * Withdraw SOL from the Time-Locked Wallet
   */
  const withdraw = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      toast.loading("Withdrawing funds...");

      // Get latest blockhash for the transaction
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Create instruction data for withdraw (just the instruction index)
      const data = Buffer.from([2]); // Instruction index for withdraw

      // Create transaction using Gill's createTransaction
      const tx = createTransaction({
        version: "legacy",
        feePayer: publicKey,
        instructions: [
          {
            programId: TIME_LOCKED_WALLET_PROGRAM_ID,
            keys: [
              { pubkey: walletPda, isSigner: false, isWritable: true },
              { pubkey: publicKey, isSigner: true, isWritable: true },
            ],
            data,
          },
        ],
        latestBlockhash: latestBlockhash.blockhash,
      });

      // Sign with wallet adapter
      const signedTx = await signTransaction(tx);

      // Get explorer link
      const signatureBytes = signedTx.signatures[0].signature;
      if (!signatureBytes) {
        toast.dismiss();
        toast.error("Failed to sign transaction");
        return null;
      }

      const signature = Buffer.from(signatureBytes).toString("hex");
      const explorerLink = getExplorerLink({
        cluster: "devnet",
        transaction: signature,
      });

      debug("Transaction explorer link: " + explorerLink);

      // Send and confirm transaction
      await sendAndConfirmTransaction(signedTx);

      toast.dismiss();
      toast.success("Funds withdrawn successfully!");
      return { signature, explorerLink };
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.dismiss();
      toast.error(`Failed to withdraw funds: ${error.message || error}`);
      return null;
    }
  }, [publicKey, signTransaction, rpc, sendAndConfirmTransaction]);

  /**
   * Close the Time-Locked Wallet
   */
  const closeWallet = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      toast.loading("Closing wallet...");

      // Get latest blockhash for the transaction
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Create instruction data for close_wallet
      const data = Buffer.from([3]); // Instruction index for close_wallet

      // Create transaction using Gill's createTransaction
      const tx = createTransaction({
        version: "legacy",
        feePayer: publicKey,
        instructions: [
          {
            programId: TIME_LOCKED_WALLET_PROGRAM_ID,
            keys: [
              { pubkey: walletPda, isSigner: false, isWritable: true },
              { pubkey: publicKey, isSigner: true, isWritable: true },
            ],
            data,
          },
        ],
        latestBlockhash: latestBlockhash.blockhash,
      });

      // Sign with wallet adapter
      const signedTx = await signTransaction(tx);

      // Get explorer link
      const signatureBytes = signedTx.signatures[0].signature;
      if (!signatureBytes) {
        toast.dismiss();
        toast.error("Failed to sign transaction");
        return null;
      }

      const signature = Buffer.from(signatureBytes).toString("hex");
      const explorerLink = getExplorerLink({
        cluster: "devnet",
        transaction: signature,
      });

      debug("Transaction explorer link: " + explorerLink);

      // Send and confirm transaction
      await sendAndConfirmTransaction(signedTx);

      toast.dismiss();
      toast.success("Wallet closed successfully!");
      return { signature, explorerLink };
    } catch (error) {
      console.error("Error closing wallet:", error);
      toast.dismiss();
      toast.error(`Failed to close wallet: ${error.message || error}`);
      return null;
    }
  }, [publicKey, signTransaction, rpc, sendAndConfirmTransaction]);

  /**
   * Get wallet data from the blockchain
   */
  const getWalletData = useCallback(async () => {
    if (!publicKey) return null;

    try {
      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Fetch account info using Gill's RPC
      const { value: accountInfo } = await rpc
        .getAccountInfo(walletPda.toBase58())
        .send();

      if (!accountInfo) {
        return null;
      }

      // Parse account data
      let data;
      if (Array.isArray(accountInfo.data)) {
        data = Buffer.from(accountInfo.data[0], accountInfo.data[1]);
      } else {
        data = Buffer.from(accountInfo.data, "base64");
      }

      // Skip 8-byte discriminator (Anchor account prefix)
      const owner = new PublicKey(data.slice(8, 40));

      // Read release_time as little-endian i64
      const releaseTimeBuffer = data.slice(40, 48);
      const releaseTimeView = new DataView(
        releaseTimeBuffer.buffer,
        releaseTimeBuffer.byteOffset,
        releaseTimeBuffer.byteLength
      );
      const releaseTime = Number(releaseTimeView.getBigInt64(0, true));

      const bump = data[48];

      // Get current balance
      const balance = accountInfo.lamports;

      debug("Wallet data retrieved successfully");
      return {
        address: walletPda,
        owner,
        releaseTime,
        bump,
        balance,
      };
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      return null;
    }
  }, [publicKey, rpc]);

  // Return all service functions
  return {
    createWallet,
    deposit,
    withdraw,
    closeWallet,
    getWalletData,
  };
}
