# Time-Locked Wallet - Using Solana Bankrun for Testing

## Testing with Bankrun

### Why Bankrun over Traditional Tests?

Solana Bankrun provides several significant advantages over traditional testing approaches:

1. **Speed & Efficiency**

   - No need to start a local validator
   - Tests run significantly faster
   - Lower resource consumption

2. **State Control**

   - Direct manipulation of blockchain state
   - Ability to modify clock for time-dependent tests
   - Control over account balances and data

3. **Deterministic Testing**
   - Consistent test environment
   - No race conditions
   - Predictable results

### Example Bankrun Test

```typescript
describe("Time Locked Wallet Bankrun Tests", () => {
  let provider: BankrunProvider;
  let program: Program<TimeLockedWallet>;
  let banksClient: BanksClient;

  beforeAll(async () => {
    // Setup bankrun environment
    context = await startAnchor(
      "",
      [{ name: "time_locked_wallet", programId: new PublicKey(IDL.address) }],
      [
        /* initial accounts */
      ]
    );

    provider = new BankrunProvider(context);
    program = new Program(IDL as TimeLockedWallet, provider);
  });

  it("Tests time-dependent functionality", async () => {
    // Manipulate blockchain time
    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        BigInt(futureTimestamp)
      )
    );
  });
});
```

### Key Bankrun Features

1. **Clock Manipulation**

```typescript
context.setClock(new Clock(...));
```

- Test time-locked features without waiting
- Simulate different blockchain timestamps
- Test schedule-dependent logic

2. **Account State Management**

```typescript
await banksClient.getBalance(walletPDA);
await banksClient.getAccount(accountPDA);
```

- Direct access to account data
- Easy balance verification
- Simplified state checks

3. **Transaction Processing**
   - Immediate transaction confirmation
   - No need for confirmation strategies
   - Reduced test flakiness

### Best Practices with Bankrun

1. **Test Setup**

   - Initialize accounts with specific states
   - Set up initial balances
   - Create required PDAs

2. **State Verification**

   - Check account states directly
   - Verify balances immediately
   - Validate PDA data

3. **Time Management**
   - Use clock manipulation for time-dependent tests
   - Test different time scenarios
   - Verify time-based constraints

### Common Testing Patterns

1. **Account Creation**

```typescript
context = await startAnchor(
  "",
  [{ programId }],
  [
    {
      address: wallet.publicKey,
      info: {
        lamports: LAMPORTS_PER_SOL,
        owner: SystemProgram.programId,
        // ... other account info
      },
    },
  ]
);
```

2. **Time-Based Testing**

```typescript
// Advance blockchain time
context.setClock(
  new Clock(slot, timestamp, epoch, leaderScheduleEpoch, BigInt(futureTime))
);
```

3. **Balance Verification**

```typescript
const balance = await banksClient.getBalance(address);
expect(Number(balance)).toBe(expectedAmount);
```

## Benefits over Traditional Testing

1. **Development Speed**

   - Faster test execution
   - Quick iteration cycles
   - Immediate feedback

2. **Reliability**

   - No network dependencies
   - Consistent test environment
   - Deterministic results

3. **Flexibility**
   - Complete state control
   - Easy debugging
   - Comprehensive testing scenarios

## Getting Started with Bankrun

1. **Installation**

```bash
pnpm add -D solana-bankrun anchor-bankrun
```

2. **Configuration**

```typescript
import { BankrunProvider } from "anchor-bankrun";
import { startAnchor } from "solana-bankrun";
```

3. **Running Tests**

```bash
anchor test
```

## Additional Resources

- [Solana Bankrun Documentation](https://github.com/kevinheavey/solana-bankrun)
- [Anchor Testing Guide](https://www.anchor-lang.com/docs/testing)
- [Bankrun Examples](https://github.com/kevinheavey/solana-bankrun/tree/main/examples)
