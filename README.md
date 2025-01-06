# NFT Creation with Metaplex

This example demonstrates how to create NFTs using Metaplex's latest tools and libraries.

## Prerequisites

```bash
npm add \
  @metaplex-foundation/mpl-token-metadata \
  @metaplex-foundation/umi-bundle-defaults \
  @metaplex-foundation/umi \
  @solana/web3.js
```

## Why Metaplex?

Metaplex provides essential tools for NFT creation on Solana:

- Token Metadata Program for NFT standards
- UMI (Unified Metaplex Interface) for simplified interactions
- Collection management
- Metadata verification

## Project Structure

```
src/
├── nft-manager.ts    # Main NFT creation logic
├── utils.ts          # Helper functions
└── index.ts          # Entry point
```

## Key Components

1. **NFTManager Class**

   - Handles collection creation
   - Manages NFT minting
   - Verifies collection items
   - Fetches NFT details

2. **Metadata Structure**

```json
{
  "name": "My NFT",
  "symbol": "MNFT",
  "description": "Description",
  "image": "https://ipfs.io/ipfs/your-image",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    }
  ]
}
```

## Steps

1. **Setup Collection**

```typescript
const nftManager = new NFTManager(endpoint, user);
const collectionAddress = await nftManager.createCollection(
  "My Collection",
  "MYCOL",
  "https://ipfs.io/ipfs/your-collection-metadata"
);
```

2. **Create NFT**

```typescript
const { mint, metadata } = await nftManager.createNFT(
  "My NFT",
  "MNFT",
  "https://ipfs.io/ipfs/your-nft-metadata"
);
```

3. **Verify NFT in Collection**

```typescript
await nftManager.verifyNFT(mint);
```

## Best Practices

1. **Metadata Storage**

   - Use IPFS or Arweave for decentralized storage
   - Follow standard metadata structure
   - Include all required fields

2. **Collection Management**

   - Create collection first
   - Verify NFTs after creation
   - Maintain consistent metadata

3. **Error Handling**
   - Check collection existence
   - Verify transactions
   - Handle metadata errors

## Common Issues & Solutions

1. **UMI Initialization**

   - Initialize UMI before creating keypair
   - Add plugins in correct order
   - Use proper endpoint

2. **Metadata Verification**
   - Ensure valid JSON structure
   - Use accessible URIs
   - Include required fields

## Resources

- [Metaplex Documentation](https://docs.metaplex.com/)
- [UMI Documentation](https://github.com/metaplex-foundation/umi)
- [Token Metadata Standard](https://docs.metaplex.com/programs/token-metadata/overview)

## Running the exmaple

```bash
# Install dependencies
npm install

# Run the example
npx esrun index.ts
```

## Next Steps & Tools

1. **Customize Metadata**

   - [NFT.Storage](https://nft.storage/) - Free IPFS storage for NFT data
   - [Arweave](https://www.arweave.org/) - Permanent storage solution
   - [Shadow Drive](https://shadow.cloud/) - Decentralized storage by GenesysGo

2. **Add Multiple NFTs**

   - [Candy Machine](https://docs.metaplex.com/programs/candy-machine/) - For NFT collections
   - [Sugar CLI](https://docs.metaplex.com/developer-tools/sugar/) - Collection deployment tool
   - [Bundlr](https://bundlr.network/) - Bulk upload to Arweave

3. **Explore Advanced Features**

   - [Token Extensions](https://spl.solana.com/token-2022) - Enhanced token features
   - [Compressed NFTs](https://docs.metaplex.com/programs/compression/) - Gas-efficient NFTs
   - [Programmable NFTs](https://docs.metaplex.com/programs/token-metadata/pnft) - Dynamic NFT behavior

4. **Implement Error Handling**

   - [Helius RPC](https://www.helius.dev/) - Enhanced RPC services
   - [Web3.js Retry](https://solana-labs.github.io/solana-web3.js/) - Transaction retry logic
   - [UMI Error Handling](https://github.com/metaplex-foundation/umi) - Metaplex error utilities

5. **Transaction Monitoring**
   - [XRAY](https://xray.helius.xyz/) - Transaction visualization
   - [Solana Explorer](https://explorer.solana.com/) - Block explorer
   - [Solscan](https://solscan.io/) - Advanced transaction analytics
