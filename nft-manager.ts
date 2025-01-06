import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
  verifyCollectionV1,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  PublicKey,
  Pda,
} from "@metaplex-foundation/umi";
import { Keypair } from "@solana/web3.js";

export class NFTManager {
  private umi;
  private collectionAddress?: PublicKey;

  constructor(endpoint: string, private user: Keypair) {
    this.umi = createUmi(endpoint).use(mplTokenMetadata());
    const umiKeypair = this.umi.eddsa.createKeypairFromSecretKey(
      user.secretKey
    );
    this.umi.use(keypairIdentity(umiKeypair));
  }

  async createCollection(
    name: string,
    symbol: string,
    uri: string
  ): Promise<PublicKey> {
    const collectionMint = generateSigner(this.umi);

    const tx = await createNft(this.umi, {
      mint: collectionMint,
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(0),
      isCollection: true,
    });

    await tx.sendAndConfirm(this.umi);

    this.collectionAddress = collectionMint.publicKey;
    return this.collectionAddress;
  }

  async createNFT(
    name: string,
    symbol: string,
    uri: string
  ): Promise<{ mint: PublicKey; metadata: Pda }> {
    if (!this.collectionAddress) {
      throw new Error("Collection not created yet");
    }

    const mint = generateSigner(this.umi);

    const tx = await createNft(this.umi, {
      mint,
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: this.collectionAddress,
        verified: false,
      },
    });

    await tx.sendAndConfirm(this.umi);

    const metadata = findMetadataPda(this.umi, { mint: mint.publicKey });
    return { mint: mint.publicKey, metadata };
  }

  async verifyNFT(nftMint: PublicKey): Promise<void> {
    if (!this.collectionAddress) {
      throw new Error("Collection not created yet");
    }

    const metadata = findMetadataPda(this.umi, { mint: nftMint });

    const tx = await verifyCollectionV1(this.umi, {
      metadata,
      collectionMint: this.collectionAddress,
      authority: this.umi.identity,
    });

    await tx.sendAndConfirm(this.umi);
  }

  async getNFTDetails(mint: PublicKey) {
    return await fetchDigitalAsset(this.umi, mint);
  }
}
