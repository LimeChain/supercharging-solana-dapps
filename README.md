# Time-Locked Wallet - Wallet Integration Demo

## Overview

This guide demonstrates how to build a Time-Locked Wallet dApp using Solana's developer tooling. We'll explore core libraries, wallet integration, and best practices through a practical example.

## Core Libraries and Dependencies

```json
{
  "@solana/web3.js": "^1.95.1",
  "@solana/wallet-adapter-base": "^0.9.23",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@coral-xyz/anchor": "^0.30.1"
}
```

### 1. @solana/web3.js - Blockchain Interaction Layer

```typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
```

Core functionality:

- Transaction construction and signing
- Account management and balance queries
- RPC connection handling
- Public key operations
- Network interaction

### 2. @solana/wallet-adapter - Wallet Integration Layer

```typescript
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
```

Features:

- Multi-wallet support (Phantom, Solflare)
- React hooks for wallet state
- Pre-built UI components
- Connection management

### 3. @coral-xyz/anchor - Program Development Framework

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
```

Capabilities:

- Type-safe program interactions
- Account deserialization
- PDA (Program Derived Address) handling
- Testing utilities

## Implementation Guide

### 1. Wallet Provider Setup

```typescript
// src/app/layout.tsx
const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### 2. Time-Locked Wallet Integration

```typescript
// src/components/time-locked-wallet/time-locked-wallet-data-access.tsx
export function useTimeLockedWallet() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
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

  // Transaction handlers
  const createWallet = useMutation({
    mutationFn: async (releaseTime: number) => {
      if (!publicKey) throw new Error("Wallet not connected");
      return program.methods
        .createWallet(new BN(releaseTime))
        .accounts({ owner: publicKey })
        .rpc();
    },
  });

  const deposit = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");
      return program.methods
        .deposit(new BN(amount * LAMPORTS_PER_SOL))
        .accounts({ owner: publicKey })
        .rpc();
    },
  });

  return { createWallet, deposit };
}
```

## Development Best Practices

### 1. Error Handling

```typescript
try {
  await transaction();
} catch (error) {
  if (error instanceof WalletError) {
    // Handle wallet-specific errors
  } else if (error instanceof AnchorError) {
    // Handle program errors
  }
}
```

### 2. Network Configuration

```typescript
const network =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta"
    ? clusterApiUrl("mainnet-beta")
    : clusterApiUrl("devnet");

const provider = new AnchorProvider(connection, wallet, {
  preflightCommitment: "processed",
});
```

### 3. Real-time Updates

```typescript
const wsConnection = new Connection(network, {
  wsEndpoint: network.replace("https", "wss"),
  commitment: "confirmed",
});
```

## Development Workflow

1. **Project Setup**

   ```bash
   npm install \
     @solana/web3.js \
     @solana/wallet-adapter-react \
     @solana/wallet-adapter-react-ui \
     @coral-xyz/anchor
   ```

2. **Development Tools**
   - Solana CLI: Network interaction
   - Anchor CLI: Program deployment
   - Solana Playground: Quick prototyping
   - Explorer: Transaction inspection

## Resources

- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Documentation](https://www.anchor-lang.com)
- [Solana Stack Exchange](https://solana.stackexchange.com)
