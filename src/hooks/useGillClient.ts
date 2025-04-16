import { createSolanaClient } from "gill";
import { useMemo } from "react";

export type ClusterName = "mainnet" | "devnet" | "testnet" | "localnet";

// Define endpoints for different clusters
const ENDPOINTS: Record<ClusterName, string> = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
  localnet: "http://127.0.0.1:8899",
};

/**
 * Custom hook to create a Gill Solana client for a specific cluster
 * @param cluster The Solana cluster to connect to (default: devnet)
 * @returns A Gill Solana client
 */
export const useGillClient = (cluster: ClusterName = "devnet") => {
  return useMemo(() => {
    // Handle custom clusters or fallback to devnet
    const endpoint = ENDPOINTS[cluster] || ENDPOINTS.devnet;

    // Create a Gill client for the specified endpoint
    const client = createSolanaClient({
      urlOrMoniker: endpoint,
    });

    return client;
  }, [cluster]);
};

export default useGillClient;
