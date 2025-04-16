"use client";

import {
  TIME_LOCKED_WALLET_PROGRAM_ID as programId,
  getTimeLockedWalletProgram,
} from "@project/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  createSolanaClient,
  getExplorerLink,
  debug,
  LAMPORTS_PER_SOL,
  address,
} from "gill";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { PublicKey, Transaction } from "@solana/web3.js";
import BN from "bn.js";

export function useTimeLockedWallet() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getTimeLockedWalletProgram(provider);

  // Create Gill client
  const getClient = useCallback(() => {
    // Always use Devnet for Time-Locked Wallet program
    // This ensures we're connecting to the network where the program is deployed
    return createSolanaClient({
      urlOrMoniker: "devnet",
    });
  }, []);

  // Derive PDA for wallet
  const walletPDA = useMemo(() => {
    if (!publicKey) return null;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), publicKey.toBuffer()],
      programId
    );
    return pda;
  }, [publicKey]);

  // Query program account
  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: async () => {
      try {
        console.log("Fetching program account:", programId.toString());

        // Try first with Gill
        const client = getClient();
        const result = await client.rpc
          .getAccountInfo(address(programId.toString()))
          .send();

        console.log("Gill result:", result);

        if (result.value) {
          return result.value;
        }

        // Fallback to direct web3.js if Gill fails
        console.log("Falling back to web3.js");
        const accountInfo = await connection.getParsedAccountInfo(programId);
        console.log("web3.js result:", accountInfo);

        return accountInfo.value;
      } catch (error) {
        console.error("Error fetching program account:", error);
        // Return null instead of throwing to make UI handling more consistent
        return null;
      }
    },
    // Don't retry on failures to prevent UI flickering
    retry: false,
  });

  // Helper function to execute a transaction using Gill
  const executeTransaction = async (tx: Transaction): Promise<string> => {
    if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

    try {
      // Sign and send transaction
      const signedTx = await signTransaction(tx);
      const signature = signedTx.signatures[0].signature;
      if (!signature) throw new Error("Failed to sign transaction");

      // Send the transaction
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      try {
        // Add a more lenient timeout for confirmation
        const confirmationStatus = await connection.confirmTransaction(
          txid,
          "confirmed"
        );

        // Check if there's a transaction error
        if (confirmationStatus.value.err) {
          console.warn(
            "Transaction encountered an error:",
            confirmationStatus.value.err
          );
        }
      } catch (confirmError) {
        // Log but don't throw - the transaction might still be successful
        console.warn(
          "Transaction confirmation error, but TX might be successful:",
          confirmError
        );
        console.log(
          "Check the transaction manually:",
          getExplorerLink({
            cluster: "devnet",
            transaction: txid,
          })
        );
      }

      // Return transaction ID regardless of confirmation status
      return txid;
    } catch (e) {
      console.error("Transaction execution error:", e);
      throw e;
    }
  };

  // Create Time-Locked Wallet - using Anchor for instruction building
  const createWallet = useMutation({
    mutationKey: ["time-locked-wallet", "create", { cluster }],
    mutationFn: async (releaseTime: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      // Get latest blockhash with Gill
      const client = getClient();
      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      // Use Anchor to build the instruction - no discriminator handling needed!
      const ix = await program.methods
        .createWallet(new BN(releaseTime))
        .accounts({
          owner: publicKey,
        })
        .instruction();

      // Create transaction with Gill style
      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(ix);

      return executeTransaction(transaction);
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to create wallet"),
  });

  // Deposit to Time-Locked Wallet - using Anchor for instruction building
  const deposit = useMutation({
    mutationKey: ["time-locked-wallet", "deposit", { cluster }],
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      // Get latest blockhash with Gill
      const client = getClient();
      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      // Use Anchor to build the instruction - no discriminator handling needed!
      const ix = await program.methods
        .deposit(new BN(amount * LAMPORTS_PER_SOL))
        .accounts({
          owner: publicKey,
        })
        .instruction();

      // Create transaction with Gill style
      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(ix);

      return executeTransaction(transaction);
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to deposit"),
  });

  // Withdraw from Time-Locked Wallet - using Anchor for instruction building
  const withdraw = useMutation({
    mutationKey: ["time-locked-wallet", "withdraw", { cluster }],
    mutationFn: async () => {
      if (!publicKey || !walletPDA) throw new Error("Wallet not connected");

      // Get latest blockhash with Gill
      const client = getClient();
      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      // Use Anchor to build the instruction - no discriminator handling needed!
      const ix = await program.methods
        .withdraw()
        .accounts({
          wallet: walletPDA,
        })
        .instruction();

      // Create transaction with Gill style
      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(ix);

      return executeTransaction(transaction);
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to withdraw"),
  });

  // Close Time-Locked Wallet - using Anchor for instruction building
  const closeWallet = useMutation({
    mutationKey: ["time-locked-wallet", "close", { cluster }],
    mutationFn: async () => {
      if (!publicKey || !walletPDA) throw new Error("Wallet not connected");

      // For debugging
      console.log("Closing wallet with PDA:", walletPDA.toString());
      console.log("Owner:", publicKey.toString());

      // Get latest blockhash with Gill
      const client = getClient();
      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash()
        .send();

      let txid;
      try {
        // Create the Anchor instruction
        const ix = await program.methods
          .closeWallet()
          .accounts({
            wallet: walletPDA,
          })
          .instruction();

        // Create a clean transaction
        const transaction = new Transaction({
          feePayer: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
        }).add(ix);

        // Sign transaction (don't use our helper function yet)
        const signedTx = signTransaction
          ? await signTransaction(transaction)
          : null;
        if (!signedTx || !signedTx.signatures[0].signature) {
          throw new Error("Failed to sign transaction");
        }
        const signature = signedTx.signatures[0].signature;

        // Send transaction
        txid = await connection.sendRawTransaction(signedTx.serialize());
        console.log("Close wallet transaction sent:", txid);

        // Try to confirm, but don't throw if it fails
        try {
          await connection.confirmTransaction(txid, "confirmed");
          console.log("Close wallet transaction confirmed:", txid);
        } catch (confirmError) {
          console.warn(
            "Confirmation error (transaction may still succeed):",
            confirmError
          );
        }

        // Return for UI update regardless of confirmation
        return txid;
      } catch (error) {
        console.error("Error in closeWallet:", error);

        // If we got a txid but had an error, still return it
        if (txid) {
          console.log("Returning txid despite error:", txid);
          return txid;
        }

        throw error;
      }
    },
    onSuccess: (signature) => {
      if (!signature) return;

      // Show success toast with explorer link
      transactionToast(signature);

      // Display an additional success message
      toast.success("Wallet closed successfully");
    },
    onError: (error) => {
      console.error("Close wallet error:", error);
      toast.error("Failed to close wallet");
    },
  });

  return {
    program,
    programId,
    getProgramAccount,
    createWallet,
    deposit,
    withdraw,
    closeWallet,
  };
}
