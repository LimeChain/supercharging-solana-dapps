"use client";

import {
  TIME_LOCKED_WALLET_PROGRAM_ID as programId,
  getTimeLockedWalletProgram,
} from "@project/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import BN from "bn.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export function useTimeLockedWallet() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getTimeLockedWalletProgram(provider);

  const walletPDA = useMemo(() => {
    if (!publicKey) return null;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), publicKey.toBuffer()],
      programId
    );
    return pda;
  }, [publicKey]);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createWallet = useMutation({
    mutationKey: ["time-locked-wallet", "create", { cluster }],
    mutationFn: async (releaseTime: number) => {
      if (!publicKey) throw new Error("Wallet not connected");
      return program.methods
        .createWallet(new BN(releaseTime))
        .accounts({
          owner: publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to create wallet"),
  });

  const deposit = useMutation({
    mutationKey: ["time-locked-wallet", "deposit", { cluster }],
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");
      return program.methods
        .deposit(new BN(amount * LAMPORTS_PER_SOL))
        .accounts({
          owner: publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to deposit"),
  });

  const withdraw = useMutation({
    mutationKey: ["time-locked-wallet", "withdraw", { cluster }],
    mutationFn: async () => {
      if (!publicKey || !walletPDA) throw new Error("Wallet not connected");
      return program.methods
        .withdraw()
        .accounts({
          wallet: walletPDA,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to withdraw"),
  });

  const closeWallet = useMutation({
    mutationKey: ["time-locked-wallet", "close", { cluster }],
    mutationFn: async () => {
      if (!publicKey || !walletPDA) throw new Error("Wallet not connected");
      return program.methods
        .closeWallet()
        .accounts({
          wallet: walletPDA,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to close wallet"),
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
