import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

// Define token type
interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  imageUri?: string;
  supply?: string;
}

// Mock token metadata with descriptions for educational purposes
const TOKENS_TO_LOOKUP = [
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    description: "USDC - The most popular stablecoin on Solana",
  },
  {
    mint: "So11111111111111111111111111111111111111112",
    description: "Wrapped SOL - SOL token made compatible with other tokens",
  },
  {
    mint: "BONK9vQy1JJ99sCGHwUQcPDqq6nGUCrWgNZQpj7rWRjL",
    description: "BONK - A popular Solana meme token",
  },
];

const TOKEN_FALLBACK_IMAGES: Record<string, string> = {
  USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  wSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  BONK: "https://cryptologos.cc/logos/bonk-bonk-logo.png",
  DEFAULT:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='12'%3E?%3C/text%3E%3C/svg%3E",
};

const MOCK_TOKENS: TokenMetadata[] = [
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    imageUri: TOKEN_FALLBACK_IMAGES.USDC,
    supply: "1000000000",
  },
  {
    mint: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    symbol: "wSOL",
    decimals: 9,
    imageUri: TOKEN_FALLBACK_IMAGES.wSOL,
    supply: "500000000",
  },
  {
    mint: "BONK9vQy1JJ99sCGHwUQcPDqq6nGUCrWgNZQpj7rWRjL",
    name: "Bonk",
    symbol: "BONK",
    decimals: 5,
    imageUri: TOKEN_FALLBACK_IMAGES.BONK,
    supply: "100000000000",
  },
];

export function MintListExample() {
  const { connection } = useConnection();
  const HELIUS_URL = `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

  // Web3.js approach (for comparison)
  const { data: web3Data, isLoading: web3Loading } = useQuery({
    queryKey: ["token-web3", TOKENS_TO_LOOKUP[0].mint],
    queryFn: async () => {
      try {
        const results = await Promise.all(
          TOKENS_TO_LOOKUP.map(async (token) => {
            // 1. Get mint account info
            const mintPubkey = new PublicKey(token.mint);
            const mintAccount = await connection.getAccountInfo(mintPubkey);

            // 2. Get metadata PDA
            const [metadataPDA] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                new PublicKey(
                  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
                ).toBuffer(),
                mintPubkey.toBuffer(),
              ],
              new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
            );

            // 3. Get metadata account
            const metadata = await Metadata.fromAccountAddress(
              connection,
              metadataPDA
            );

            // 4. Get token supply
            const supply = await connection.getTokenSupply(mintPubkey);

            return {
              mint: token.mint,
              supply: supply.value.amount,
              decimals: supply.value.decimals,
              metadata,
            };
          })
        );
        return results;
      } catch (error) {
        console.error("Web3.js error:", error);
        return null;
      }
    },
  });

  // Existing Helius approach
  const { data: heliusData, isLoading: heliusLoading } = useQuery({
    queryKey: ["mint-list"],
    queryFn: async () => {
      try {
        // Using Helius API to get detailed information about these tokens
        const response = await fetch(HELIUS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mintAccounts: TOKENS_TO_LOOKUP.map((t) => t.mint),
          }),
        });

        const result = await response.json();
        console.log("Token Response:", result);

        if (!result?.result || result.error) {
          console.log("Using mock token data");
          return MOCK_TOKENS;
        }

        return result.result.map((token: any) => ({
          mint: token.account || token.mint || "Unknown",
          name: token.onchain?.metadata?.data?.name || "Unknown Token",
          symbol: token.onchain?.metadata?.data?.symbol || "???",
          decimals: token.onchain?.metadata?.data?.decimals || 0,
          imageUri: token.onchain?.metadata?.data?.uri || "/placeholder.png",
          supply: token.onchain?.supply?.toString() || "0",
        }));
      } catch (error) {
        console.log("Error fetching token data, using mocks:", error);
        return MOCK_TOKENS;
      }
    },
  });

  const getTokenImage = (token: TokenMetadata) => {
    // Try the token's image first
    if (token.imageUri) return token.imageUri;

    // Then try the fallback for this specific token
    if (token.symbol && TOKEN_FALLBACK_IMAGES[token.symbol]) {
      return TOKEN_FALLBACK_IMAGES[token.symbol];
    }

    // Finally use the default fallback
    return TOKEN_FALLBACK_IMAGES.DEFAULT;
  };

  // Check both loading states
  if (web3Loading || heliusLoading) return <div>Loading mint data...</div>;

  return (
    <div className="space-y-8">
      {/* Educational section */}
      <div className="alert alert-info">
        <div>
          <h3 className="font-bold text-lg">
            Understanding Token Metadata Fetching
          </h3>
          <p className="text-sm">
            Below you can see two different approaches to fetch token
            information on Solana
          </p>
        </div>
      </div>

      {/* Comparison section */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">
              Traditional Web3.js Approach
              {web3Loading && <span className="loading loading-spinner"></span>}
            </h2>
            <div className="space-y-4">
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Required Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Get mint account info</li>
                  <li>Derive metadata PDA</li>
                  <li>Fetch metadata account</li>
                  <li>Parse metadata data</li>
                  <li>Separate call for supply</li>
                </ol>
              </div>
              <div className="text-xs opacity-75">
                Multiple RPC calls required per token
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">
              Helius Enhanced Approach
              {heliusLoading && (
                <span className="loading loading-spinner"></span>
              )}
            </h2>
            <div className="space-y-4">
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Required Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Single API call for multiple tokens</li>
                  <li>Get complete data with rich metadata</li>
                </ol>
              </div>
              <div className="text-xs opacity-75">
                Optimized for performance and ease of use
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing token display */}
      <div className="grid gap-4">
        {heliusData?.map((token: TokenMetadata) => (
          <div key={token.mint} className="card bg-base-200">
            <div className="card-body flex flex-row items-center">
              <div className="avatar">
                <div className="w-16 h-16 rounded-full bg-base-300">
                  <img
                    src={getTokenImage(token)}
                    alt={token.name}
                    className="object-contain"
                    onError={(e) => {
                      // Only set fallback once to prevent loops
                      if (
                        e.currentTarget.src !== TOKEN_FALLBACK_IMAGES.DEFAULT
                      ) {
                        e.currentTarget.src = TOKEN_FALLBACK_IMAGES.DEFAULT;
                      }
                    }}
                  />
                </div>
              </div>
              <div className="ml-4 flex-grow">
                <h2 className="card-title">{token.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>Symbol: {token.symbol}</p>
                    <p>Decimals: {token.decimals}</p>
                  </div>
                  <div>
                    <p>Supply: {Number(token.supply || 0).toLocaleString()}</p>
                    <p className="truncate">
                      Mint:{" "}
                      {token.mint ? `${token.mint.slice(0, 8)}...` : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
