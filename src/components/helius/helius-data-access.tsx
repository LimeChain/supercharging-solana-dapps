import { useQuery } from "@tanstack/react-query";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCluster } from "../cluster/cluster-data-access";
import { parseTimeLockedWalletTransaction } from "./parse-program-transactions";

// Fetch transactions using Helius
export function useHeliusTransactions() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const HELIUS_URL = `https://api.helius.xyz/v0/transactions/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

  return useQuery({
    queryKey: ["helius-transactions", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return null;

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 10,
        });

        if (signatures.length === 0) {
          return [];
        }

        const response = await fetch(HELIUS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions: signatures.map((sig) => sig.signature),
          }),
        });

        const data = await response.json();
        console.log("Helius response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching Helius transactions:", error);
        throw error;
      }
    },
    enabled: !!publicKey,
  });
}

// Fetch the same transactions using Web3.js
export function useWeb3Transactions() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: [
      "web3-transactions",
      { endpoint: connection.rpcEndpoint, publicKey: publicKey?.toString() },
    ],
    queryFn: async () => {
      if (!publicKey) return [];

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 10,
        });

        const transactions = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });
            return {
              signature: sig.signature,
              timestamp: sig.blockTime,
              fee: tx?.meta?.fee || 0,
              successful: !tx?.meta?.err,
              balanceChanges: tx?.meta?.postBalances.map((post, i) => ({
                address:
                  tx.transaction.message.accountKeys[i].pubkey.toString(),
                change: (post - (tx.meta?.preBalances[i] || 0)) / 1e9,
              })),
              instructions: tx?.transaction.message.instructions,
              raw: tx, // Include raw transaction data for comparison
            };
          })
        );
        return transactions;
      } catch (error) {
        console.error("Error fetching Web3 transactions:", error);
        throw error;
      }
    },
    enabled: !!publicKey,
  });
}
