# Time-Locked Wallet - Anchor Framework Demo

A demonstration of building a Solana program using the Anchor framework, featuring comprehensive testing with Jest. This example showcases how to create a time-locked wallet for SOL tokens.

## Core Features

- 🔒 Testing Time-locked wallet creation with PDA (Program Derived Address)
- 💰 Testing SOL deposit functionality
- ⏰ Testing Time-based withdrawal mechanism
- 🏦 Testing Rent-exempt balance handling
- 🧹 Testing Account cleanup and closure

## Program Architecture

### Core Functions

1. **create_wallet**

   ```typescript
   public async createWallet(owner: PublicKey, releaseTime: number)
   ```

   - Creates a new time-locked wallet
   - Uses PDA derived from owner's public key
   - Sets release time and initializes state

2. **deposit**

   ```typescript
   public async deposit(owner: PublicKey, amount: number)
   ```

   - Deposits SOL into the wallet
   - Handles rent-exempt reserve
   - Updates account balance

3. **withdraw**

   ```typescript
   public async withdraw(owner: PublicKey)
   ```

   - Validates release time
   - Handles rent-exempt balance retention
   - Transfers funds to owner

4. **close_wallet**
   ```typescript
   public async closeWallet(owner: PublicKey)
   ```
   - Closes the wallet account
   - Returns rent to owner
   - Cleanup PDA

## Project Structure and Testing Setup

This project, created with `create-solana-dapp`, implements a full-stack architecture with distinct testing approaches:

```
/
├── src/                  # Frontend (Next.js)
│   ├── app/             # Next.js pages
│   └── components/      # React components
└── anchor/              # Solana program (Backend)
    └── tests/          # Program tests
```

### Testing Architecture

Our project uses Jest across both frontend and backend, which differs from a standard Anchor project setup:

1. **Standard Anchor Projects**

   - Typically use Mocha/Chai
   - Default testing framework for Anchor
   - Common in standalone Solana programs

2. **Our Setup (via create-solana-dapp)**
   - Uses Jest for consistency across the stack
   - Tests both frontend and backend components
   - Adapts Anchor tests to use Jest syntax

### Why This Approach?

`create-solana-dapp` configures Jest as the unified testing framework because:

- Provides consistent testing syntax across frontend and backend
- Leverages Jest's modern features for both layers
- Simplifies the development experience with a single testing framework

Example of our Jest syntax in Anchor tests:

```typescript
describe("time_locked_wallet", () => {
  it("Creates a time-locked wallet", async () => {
    // ... test implementation
    expect(walletAccount.owner.toString()).toBe(wallet.publicKey.toString());
  });
});
```

Same test in traditional Anchor style (Mocha/Chai):

```typescript
describe("time_locked_wallet", () => {
  it("Creates a time-locked wallet", async () => {
    // ... test implementation
    assert.equal(walletAccount.owner.toString(), wallet.publicKey.toString());
  });
});
```

### Running Tests

```bash
# For Anchor program tests (in anchor directory)
cd anchor && anchor test
```

## Testing Examples

### 1. Wallet Creation Test

```typescript
it("creates a time-locked wallet", async () => {
  const releaseTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  await program.methods
    .createWallet(new BN(releaseTime))
    .accounts({
      owner: provider.wallet.publicKey,
      wallet: walletPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const walletAccount = await program.account.wallet.fetch(walletPDA);
  expect(walletAccount.owner).toEqual(provider.wallet.publicKey);
  expect(walletAccount.releaseTime.toNumber()).toEqual(releaseTime);
});
```

### 2. Deposit Test

```typescript
it("deposits SOL into wallet", async () => {
  const depositAmount = new BN(1_000_000_000); // 1 SOL
  const initialBalance = await provider.connection.getBalance(walletPDA);

  await program.methods
    .deposit(depositAmount)
    .accounts({
      owner: provider.wallet.publicKey,
      wallet: walletPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const finalBalance = await provider.connection.getBalance(walletPDA);
  expect(finalBalance - initialBalance).toEqual(depositAmount.toNumber());
});
```

### 3. Time-Based Withdrawal Test

```typescript
it("prevents early withdrawal", async () => {
  await expect(
    program.methods
      .withdraw()
      .accounts({
        owner: provider.wallet.publicKey,
        wallet: walletPDA,
      })
      .rpc()
  ).rejects.toThrow("TooEarly");
});
```

## Testing Best Practices

1. **Isolation**: Each test should run independently
2. **Clean State**: Reset state between tests
3. **Mock Time**: Use Jest's timer mocks for time-dependent tests
4. **Error Cases**: Test both success and failure scenarios
5. **Coverage**: Aim for high test coverage

## Resources

- 📚 [Anchor Documentation](https://www.anchor-lang.com/)
- 🧪 [Jest Documentation](https://jestjs.io/)
- 💻 [Solana Cookbook](https://solanacookbook.com)
- 🤝 [Solana Discord](https://discord.com/invite/solana)
