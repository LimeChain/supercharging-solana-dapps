# Time-Locked Wallet - Modern Solana Development with Gill and Anchor

## Overview

This guide demonstrates how to build a Time-Locked Wallet dApp using Solana's modern developer tooling. We showcase how to combine Anchor and Gill for optimal Solana development, leveraging the strengths of both frameworks.

## Core Libraries and Dependencies

```json
{
  "@solana/web3.js": "^1.95.1",
  "@solana/wallet-adapter-base": "^0.9.23",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@coral-xyz/anchor": "^0.30.1",
  "gill": "^0.8.2"
}
```

## Architecture: Combining Anchor and Gill

This project demonstrates a hybrid approach that leverages the strengths of both Anchor and Gill:

- **Anchor** provides type-safety, account validation, and automatic handling of instruction discriminators
- **Gill** offers a modern client API, improved transaction handling, and built-in utilities

```typescript
// Get Anchor program instance
const provider = useAnchorProvider();
const program = getTimeLockedWalletProgram(provider);

// Use Gill for RPC calls
const client = createSolanaClient({ urlOrMoniker: "devnet" });
const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();

// Combine: Use Anchor for instruction building
const ix = await program.methods
  .closeWallet()
  .accounts({
    wallet: walletPDA,
  })
  .instruction();

// Combine: Use web3.js Transaction with Gill-obtained blockhash
const transaction = new Transaction({
  feePayer: publicKey,
  recentBlockhash: latestBlockhash.blockhash,
}).add(ix);

// Sign and send
const signedTx = await signTransaction(transaction);
const txid = await connection.sendRawTransaction(signedTx.serialize());
```

### 1. Gill - Next-Generation Solana JavaScript SDK

```typescript
import { createSolanaClient, getExplorerLink, address } from "gill";

// Create a client for RPC interactions
const client = createSolanaClient({ urlOrMoniker: "devnet" });

// Get the latest blockhash in a clean, modern syntax
const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();

// Easy explorer link generation
const explorerLink = getExplorerLink({
  cluster: "devnet",
  transaction: signature,
});
```

Key benefits:

- Tree-shakable, lightweight client for reduced bundle size
- Modern API design with improved developer experience
- Simplified transaction building and sending
- Built-in utilities (explorer links, debug tools)
- Compatible with the entire Solana ecosystem

### 2. @coral-xyz/anchor - Program Interaction Framework

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";

// Create program instance
const program = getTimeLockedWalletProgram(provider);

// Build instruction with type safety
const ix = await program.methods
  .createWallet(new BN(releaseTime))
  .accounts({
    owner: publicKey,
  })
  .instruction();
```

Capabilities:

- Type-safe program interactions
- Automatic handling of instruction discriminators
- Account validation and deserialization
- PDA (Program Derived Address) handling
- Testing utilities

## Handling Anchor Discriminators

Anchor programs require 8-byte instruction discriminators as identifiers. When using the Anchor client library with Gill, these are handled automatically:

```typescript
// The Anchor client automatically adds the discriminator
// No manual handling required
const ix = await program.methods
  .closeWallet()
  .accounts({
    wallet: walletPDA,
  })
  .instruction();
```

## Best Practices for Transaction Error Handling

This repository implements robust transaction error handling to improve user experience:

```typescript
try {
  // Send transaction
  const txid = await connection.sendRawTransaction(signedTx.serialize());

  try {
    // Confirm with reasonable timeout
    await connection.confirmTransaction(txid, "confirmed");
    console.log("Transaction confirmed:", txid);
  } catch (confirmError) {
    // Don't fail if confirmation times out - transaction may still succeed
    console.warn(
      "Confirmation error (transaction may still succeed):",
      confirmError
    );
  }

  // Return transaction ID regardless
  return txid;
} catch (error) {
  // Handle transaction errors appropriately
  console.error("Transaction error:", error);
  throw error;
}
```

## Development Best Practices

### 1. Error Handling

Always implement robust error handling, especially for blockchain transactions which may appear to fail client-side but succeed on-chain.

### 2. Network Configuration

```typescript
// Using Gill's unified approach
const client = createSolanaClient({
  urlOrMoniker: "devnet", // Use specific network where your program is deployed
});
```

### 3. Proper Account Specification

Let Anchor handle accounts correctly based on your program's IDL:

```typescript
// Type-safe account loading
const ix = await program.methods
  .closeWallet()
  .accounts({
    wallet: walletPDA,
    // Anchor will add any other required accounts
  })
  .instruction();
```

## Development Workflow

1. **Project Setup**

   ```bash
   pnpm install
   ```

2. **Run Development Server**

   ```bash
   pnpm dev
   ```

3. **Interact with the Time-Locked Wallet**
   - Connect your wallet
   - Create a new time-locked wallet
   - Deposit SOL
   - Withdraw after the time lock expires
   - Close the wallet when done

## Resources

- [Solana Cookbook](https://solanacookbook.com)
- [Gill Documentation](https://github.com/solana-foundation/gill)
- [Anchor Documentation](https://www.anchor-lang.com)
- [Solana Stack Exchange](https://solana.stackexchange.com)
