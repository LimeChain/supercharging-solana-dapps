# Time-Locked Wallet with Helius Integration

## Overview

This project demonstrates a Time-Locked Wallet implementation on Solana with enhanced transaction monitoring using Helius. It showcases both frontend and potential backend integrations for transaction parsing and monitoring.

## Helius Integration Features

### Transaction History Parser

- Side-by-side comparison of Web3.js and Helius transaction data
- Enhanced NFT transaction parsing
- Detailed token transfer information
- Human-readable transaction descriptions
- Raw transaction data comparison
- Decoded event information

### Digital Asset Standard (DAS)

- NFT holdings for any wallet address
- Rich NFT metadata display
- Collection information
- Attribute handling
- Image rendering with fallbacks
- Ownership verification

### Token Mint List

- Token metadata lookup
- Supply information
- Token image handling
- Price data (when available)
- Market cap information
- Holder statistics

### Getting Started

1. Get your Helius API key from [Helius Dashboard](https://dev.helius.xyz)
2. Add your API key to `.env.local`:

```env
NEXT_PUBLIC_HELIUS_API_KEY=your_api_key_here
```

### Resources

- [Helius Documentation](https://docs.helius.xyz/)
- [API Reference](https://docs.helius.xyz/reference/getting-started-with-the-api)
- [Helius Dashboard](https://dev.helius.xyz)
