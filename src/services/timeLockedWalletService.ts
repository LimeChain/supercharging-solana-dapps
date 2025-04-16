import {
  createSolanaClient,
  getExplorerLink,
  createTransaction,
  LAMPORTS_PER_SOL,
} from "gill";
import { PublicKey } from "@solana/web3.js";
import { TIME_LOCKED_WALLET_PROGRAM_ID } from "../../anchor/src/time-locked-wallet-exports";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

// Derive PDA for wallet account
export const deriveWalletAddress = (owner: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("wallet"), owner.toBuffer()],
    TIME_LOCKED_WALLET_PROGRAM_ID
  );
};

// Create a hook for interacting with the Time-Locked Wallet program
export const useTimeLockedWallet = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const createWallet = useCallback(
    async (releaseTime: number) => {
      if (!publicKey || !signTransaction) {
        toast.error("Wallet not connected");
        return;
      }

      try {
        // Create Solana client using Gill
        const { rpc, sendAndConfirmTransaction } = createSolanaClient({
          connection,
        });

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

        // Create the memo instruction following Gill's example format
        const createWalletIx = {
          programId: TIME_LOCKED_WALLET_PROGRAM_ID,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: walletPda, isSigner: false, isWritable: true },
            {
              pubkey: new PublicKey("11111111111111111111111111111111"),
              isSigner: false,
              isWritable: false,
            },
          ],
          data,
        };

        // Create transaction using Gill's createTransaction
        const tx = createTransaction({
          version: "legacy",
          feePayer: publicKey,
          instructions: [createWalletIx],
          latestBlockhash,
        });

        // Sign with wallet (using the adapter)
        const signedTx = await signTransaction(tx);

        // Get explorer link - this is a utility function in Gill
        const signature = Buffer.from(signedTx.signatures[0]).toString("hex");
        const explorerLink = getExplorerLink({
          cluster: "devnet",
          transaction: signature,
        });

        console.log("Sending transaction:", explorerLink);
        toast.loading("Creating wallet...");

        // Send and confirm transaction
        await sendAndConfirmTransaction(signedTx);

        toast.success("Wallet created successfully!");
        return { walletAddress: walletPda, signature };
      } catch (error) {
        console.error("Error creating wallet:", error);
        toast.error("Failed to create wallet");
        return null;
      }
    },
    [publicKey, signTransaction, connection]
  );

  const deposit = useCallback(
    async (amount: number) => {
      if (!publicKey || !signTransaction) {
        toast.error("Wallet not connected");
        return;
      }

      try {
        // Create Solana client using Gill
        const { rpc, sendAndConfirmTransaction } = createSolanaClient({
          connection,
        });

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

        // Create the deposit instruction
        const depositIx = {
          programId: TIME_LOCKED_WALLET_PROGRAM_ID,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: walletPda, isSigner: false, isWritable: true },
            {
              pubkey: new PublicKey("11111111111111111111111111111111"),
              isSigner: false,
              isWritable: false,
            },
          ],
          data,
        };

        // Create transaction using Gill's createTransaction
        const tx = createTransaction({
          version: "legacy",
          feePayer: publicKey,
          instructions: [depositIx],
          latestBlockhash,
        });

        // Sign with wallet (using the adapter)
        const signedTx = await signTransaction(tx);

        // Get explorer link
        const signature = Buffer.from(signedTx.signatures[0]).toString("hex");
        const explorerLink = getExplorerLink({
          cluster: "devnet",
          transaction: signature,
        });

        console.log("Sending transaction:", explorerLink);
        toast.loading("Depositing funds...");

        // Send and confirm transaction
        await sendAndConfirmTransaction(signedTx);

        toast.success("Funds deposited successfully!");
        return { signature };
      } catch (error) {
        console.error("Error depositing funds:", error);
        toast.error("Failed to deposit funds");
        return null;
      }
    },
    [publicKey, signTransaction, connection]
  );

  const withdraw = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Create Solana client using Gill
      const { rpc, sendAndConfirmTransaction } = createSolanaClient({
        connection,
      });

      // Get latest blockhash for the transaction
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Create instruction data for withdraw
      const data = Buffer.from([2]); // Instruction index for withdraw

      // Create the withdraw instruction
      const withdrawIx = {
        programId: TIME_LOCKED_WALLET_PROGRAM_ID,
        keys: [
          { pubkey: walletPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
        ],
        data,
      };

      // Create transaction using Gill's createTransaction
      const tx = createTransaction({
        version: "legacy",
        feePayer: publicKey,
        instructions: [withdrawIx],
        latestBlockhash,
      });

      // Sign with wallet (using the adapter)
      const signedTx = await signTransaction(tx);

      // Get explorer link
      const signature = Buffer.from(signedTx.signatures[0]).toString("hex");
      const explorerLink = getExplorerLink({
        cluster: "devnet",
        transaction: signature,
      });

      console.log("Sending transaction:", explorerLink);
      toast.loading("Withdrawing funds...");

      // Send and confirm transaction
      await sendAndConfirmTransaction(signedTx);

      toast.success("Funds withdrawn successfully!");
      return { signature };
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error("Failed to withdraw funds");
      return null;
    }
  }, [publicKey, signTransaction, connection]);

  const closeWallet = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Create Solana client using Gill
      const { rpc, sendAndConfirmTransaction } = createSolanaClient({
        connection,
      });

      // Get latest blockhash for the transaction
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Create instruction data for close_wallet
      const data = Buffer.from([3]); // Instruction index for close_wallet

      // Create the close wallet instruction
      const closeWalletIx = {
        programId: TIME_LOCKED_WALLET_PROGRAM_ID,
        keys: [
          { pubkey: walletPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
        ],
        data,
      };

      // Create transaction using Gill's createTransaction
      const tx = createTransaction({
        version: "legacy",
        feePayer: publicKey,
        instructions: [closeWalletIx],
        latestBlockhash,
      });

      // Sign with wallet (using the adapter)
      const signedTx = await signTransaction(tx);

      // Get explorer link
      const signature = Buffer.from(signedTx.signatures[0]).toString("hex");
      const explorerLink = getExplorerLink({
        cluster: "devnet",
        transaction: signature,
      });

      console.log("Sending transaction:", explorerLink);
      toast.loading("Closing wallet...");

      // Send and confirm transaction
      await sendAndConfirmTransaction(signedTx);

      toast.success("Wallet closed successfully!");
      return { signature };
    } catch (error) {
      console.error("Error closing wallet:", error);
      toast.error("Failed to close wallet");
      return null;
    }
  }, [publicKey, signTransaction, connection]);

  const getWalletData = useCallback(async () => {
    if (!publicKey) return null;

    try {
      // Create Solana client using Gill
      const { rpc } = createSolanaClient({
        connection,
      });

      // Derive wallet PDA
      const [walletPda] = deriveWalletAddress(publicKey);

      // Fetch account info using Gill
      const { value: accountInfo } = await rpc
        .getAccountInfo(walletPda.toString())
        .send();

      if (!accountInfo) {
        return null;
      }

      // Parse account data - assuming 8-byte discriminator, 32-byte owner, 8-byte release time, 1-byte bump
      // Handle the data format returned by Gill
      let data;
      if (Array.isArray(accountInfo.data)) {
        data = Buffer.from(accountInfo.data[0], accountInfo.data[1]);
      } else {
        data = Buffer.from(accountInfo.data, "base64");
      }

      // Skip 8-byte discriminator
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
  }, [publicKey, connection]);

  // Return the service functions
  return {
    createWallet,
    deposit,
    withdraw,
    closeWallet,
    getWalletData,
  };
};
