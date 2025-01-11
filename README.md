# Time-Locked Wallet Program

A Solana program that creates time-locked wallets where funds can only be withdrawn after a specified release time.

## Features

- Create time-locked wallets
- Deposit SOL into wallets
- Withdraw funds after release time
- Close wallets and recover rent

## Development

### Prerequisites

- Rust and Cargo
- Solana CLI tools
- Anchor Framework
- Zest: Install with `cargo install --git https://github.com/LimeChain/zest zest --force`

### Building

```bash
cd anchor
anchor build
```

### Testing

Run the unit tests:

```bash
cargo test
```

Run coverage analysis:

```bash
zest coverage
```

## Why Zest?

Zest offers several advantages over traditional testing approaches:

1. **Native Program Testing**

   - Works with Rust-written Solana programs
   - Compatible with solana-program-test framework
   - Supports programs that run with `cargo test`

2. **Coverage Analysis**

   - Detailed coverage reporting
   - Identifies untested code paths
   - Multiple output formats (lcov, html)

3. **Integration with Cargo**

   - Works with standard Rust tooling
   - Simple configuration via TOML files
   - Flexible command-line options

## Project Structure

```
anchor/
├── programs/
│   └── time_locked_wallet/
│       ├── src/
│       │   └── lib.rs           # Program logic
│       ├── tests/
│       │   └── time_locked_wallet.rs  # Unit tests
│       └── zest-coverage.toml   # Zest configuration
└── Anchor.toml                  # Anchor configuration
```

## Testing Strategy

1. **Unit Tests**

   - Test individual instructions
   - Verify account constraints
   - Check error conditions

2. **Coverage Analysis**
   - Run `cargo zest coverage`
   - Review uncovered code paths
   - Add tests for missing scenarios

## Best Practices

1. **Test Organization**

   - Group related tests together
   - Use helper functions for common operations
   - Test both success and failure cases

2. **Coverage Goals**

   - Aim for high code coverage
   - Test edge cases
   - Include negative test cases

3. **Maintenance**
   - Keep tests up to date with program changes
   - Regular coverage analysis
   - Document test scenarios

## References

- [Zest Repository](https://github.com/LimeChain/zest) - A code coverage CLI tool for Solana programs by LimeChain
