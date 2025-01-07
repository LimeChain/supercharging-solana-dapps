"use client";

import {
  TIME_LOCKED_WALLET_PROGRAM_ID as programId,
  getTimeLockedWalletProgram,
} from "@project/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import BN from "bn.js";

export function useTimeLockedWallet() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getTimeLockedWalletProgram(provider);

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

  return {
    program,
    programId,
    getProgramAccount,
    createWallet,
  };
}
