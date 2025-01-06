import { NFTManager } from "./nft-manager";
import { loadKeypairFromFile } from "./utils";

async function main() {
  // Initialize
  const endpoint = "https://api.devnet.solana.com";
  const user = await loadKeypairFromFile();
  const nftManager = new NFTManager(endpoint, user);

  try {
    // Create collection
    console.log("Creating collection...");
    const collectionAddress = await nftManager.createCollection(
      "My Collection",
      "MYCOL",
      "https://example.com/collection.json"
    );
    console.log("Collection created:", collectionAddress.toString());

    // Create NFT
    console.log("Creating NFT...");
    const { mint: nftMint } = await nftManager.createNFT(
      "My NFT",
      "MNFT",
      "https://ipfs.io/ipfs/QmPK7QwsffMA1iNNz3FLNJsGxr9mPN541tDdAabb2gajFR"
    );
    console.log("NFT created:", nftMint.toString());

    // Verify NFT
    console.log("Verifying NFT...");
    await nftManager.verifyNFT(nftMint);
    console.log("NFT verified!");

    // Get NFT details
    const nftDetails = await nftManager.getNFTDetails(nftMint);
    console.log("NFT details:", nftDetails);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
