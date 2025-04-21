# Supercharging Solana dApp Development: Developer Tooling Overview

Welcome to the **Supercharging Solana dApp Development** workshop! This repository contains materials and code examples to help you explore the rich ecosystem of tools available for Solana dApp development.

This project was generated using `npx create-solana-dapp` with the following options:

- Framework: **Next.js**
- Styling: **TailwindCSS**
- Template: **Basic Project**

## Agenda

1. **Overview of Solana dApp Development**
   - Where to start from
   - Useful websites and tools
   - What is the workflow of Solana dApp development
2. **Developer Tools and Their Use Cases**
   - Frameworks
   - Testing
   - Monitoring
   - FE Integration
   - Code Quality
3. **Hands-On Demos**
   - Switching between GitHub branches for each tool.
   - Highlighting **Zest** for code coverage.

---

## Tools Covered

1. **Solana Playground**: Quick prototyping and experimentation.
2. **Anchor Framework** - For programs (smart contract) development.
3. **Bankrun** - Modern testing for Solana programs.
4. **Metaplex SDK** - Tools for NFTs and marketplaces.
5. **Helius API** - Real-time monitoring and transaction indexing.
6. **Solana Wallet Adapter** - Simplified wallet integration.
7. **Zest** - Code coverage for Solana projects.

---

## Description

### Slides

The slides for the workshop can be found in the [slides](./slides/) directory.

---

### Branches for Demos

Each branch in this repository contains a ready-to-use example with readme for the respective tool. Use the following branches:

- **`demo-solana-playground`**: Example using the Solana Playground.
- **`demo-anchor`**: Example using the Anchor framework.
- **`demo-bankrun`**: Testing Solana programs with Bankrun.
- **`demo-metaplex`**: NFT minting and marketplace setup.
- **`demo-wallet-integration`**: Wallet Adapter integration.
- **`demo-wallet-integration-gill`**: Wallet Adapter integration with gill.
- **`demo-monitoring`**: Using Helius API for monitoring.
- **`demo-zest`**: Generating code coverage reports with Zest.

---

## What do you need

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone https://github.com/ochikov/supercharging-solana-dapps.git
```

#### Install Dependencies

```shell
pnpm install
```

#### Start the web app

```
pnpm dev
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the command with `pnpm`, eg: `pnpm anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/basic-exports.ts` to match the new program id.

```shell
pnpm anchor keys sync
```

#### Build the program:

```shell
pnpm anchor-build
```

#### Start the test validator with the program deployed:

```shell
pnpm anchor-localnet
```

#### Run the tests

```shell
pnpm anchor-test
```

#### Deploy to Devnet

```shell
pnpm anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
pnpm dev
```

Build the web app

```shell
pnpm build
```
