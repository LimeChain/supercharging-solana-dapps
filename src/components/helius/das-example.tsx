import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";

// Mock NFT data
const MOCK_NFTS = [
  {
    id: "1",
    content: {
      metadata: {
        name: "Solana Monkey Business #1234",
        description: "A unique monkey NFT on Solana blockchain",
        attributes: [
          { trait_type: "Background", value: "Blue" },
          { trait_type: "Fur", value: "Golden" },
          { trait_type: "Eyes", value: "Laser" },
          { trait_type: "Hat", value: "Crown" },
        ],
      },
      links: {
        image: "https://arweave.net/123/content/monkey.png",
      },
    },
  },
  {
    id: "2",
    content: {
      metadata: {
        name: "DeGods #4567",
        description: "A DeGod from the popular Solana NFT collection",
        attributes: [
          { trait_type: "Background", value: "Galaxy" },
          { trait_type: "Skin", value: "Diamond" },
          { trait_type: "Clothing", value: "Leather Jacket" },
        ],
      },
      links: {
        image: "https://nftstorage.link/degod.png",
      },
    },
  },
  {
    id: "3",
    content: {
      metadata: {
        name: "Okay Bear #789",
        description: "A cute bear from the Okay Bears collection",
        attributes: [
          { trait_type: "Expression", value: "Happy" },
          { trait_type: "Outfit", value: "Hawaiian Shirt" },
          { trait_type: "Accessory", value: "Sunglasses" },
        ],
      },
      links: {
        image: "https://nftstorage.link/bear.png",
      },
    },
  },
];

export function DASExample() {
  const { publicKey } = useWallet();
  const HELIUS_URL = `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["nft-holdings", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return null;

      // Try to fetch real data first
      const response = await fetch(HELIUS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-id",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: publicKey.toString(),
            page: 1,
            limit: 10,
          },
        }),
      });

      const result = await response.json();
      console.log("NFT Response:", result);

      // If no real NFTs found, return mock data
      if (!result.result || result.result.length === 0) {
        console.log("No real NFTs found, using mock data");
        return MOCK_NFTS;
      }

      return result.result;
    },
    enabled: !!publicKey,
  });

  if (!publicKey) return <div>Please connect your wallet</div>;
  if (isLoading) return <div>Loading NFT data...</div>;
  if (error) return <div>Error loading NFTs: {String(error)}</div>;
  if (!data || !Array.isArray(data)) return <div>No NFTs found</div>;

  return (
    <div>
      <div className="alert alert-info mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <h3 className="font-bold">Demo Mode</h3>
          <div className="text-sm">
            Showing mock NFT data for demonstration purposes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((nft: any) => (
          <div key={nft.id} className="card bg-base-200">
            <figure className="px-4 pt-4">
              <img
                src={nft.content?.links?.image || "/placeholder.png"}
                alt={nft.content?.metadata?.name}
                className="rounded-xl"
                onError={(e) => {
                  // Fallback images for mock data
                  e.currentTarget.src = `https://picsum.photos/seed/${nft.id}/400/400`;
                }}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{nft.content?.metadata?.name}</h2>
              <p className="text-sm">{nft.content?.metadata?.description}</p>
              <div className="flex flex-wrap gap-2">
                {nft.content?.metadata?.attributes?.map((attr: any) => (
                  <span key={attr.trait_type} className="badge badge-primary">
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
