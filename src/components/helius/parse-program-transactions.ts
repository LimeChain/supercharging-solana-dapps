import { TIME_LOCKED_WALLET_PROGRAM_ID } from "@project/anchor";

export function parseTimeLockedWalletTransaction(tx: any) {
  // For mainnet transactions from Helius
  if (
    tx.type === "PROGRAM_CALL" &&
    tx.programId === TIME_LOCKED_WALLET_PROGRAM_ID.toString()
  ) {
    // Get the instruction name from the transaction
    const instructionName =
      tx.events?.programEvent?.name || tx.instructions?.[0]?.name;

    switch (instructionName) {
      case "create_wallet":
        return {
          ...tx,
          type: "Create Time-Locked Wallet",
          description: "Created a new time-locked wallet",
          tokenTransfers: [],
          events: [
            {
              type: "create",
              releaseTime: tx.events?.programEvent?.data?.releaseTime,
              owner: tx.events?.programEvent?.data?.owner,
            },
          ],
        };

      case "deposit":
        const amount =
          tx.events?.programEvent?.data?.amount ||
          tx.instructions?.[0]?.data?.amount;
        return {
          ...tx,
          type: "Time-Locked Wallet Deposit",
          description: `Deposited ${amount / 1e9} SOL to time-locked wallet`,
          tokenTransfers: [
            {
              amount: amount / 1e9,
              tokenName: "SOL",
              fromUserAccount: tx.source,
              toUserAccount: tx.destination,
            },
          ],
        };

      case "withdraw":
        return {
          ...tx,
          type: "Time-Locked Wallet Withdrawal",
          description: "Withdrew funds from time-locked wallet",
          tokenTransfers: [
            {
              amount: tx.meta?.postBalances[0] - tx.meta?.preBalances[0],
              tokenName: "SOL",
              fromUserAccount: tx.source,
              toUserAccount: tx.destination,
            },
          ],
        };

      case "close":
        return {
          ...tx,
          type: "Close Time-Locked Wallet",
          description: "Closed time-locked wallet account",
        };
    }
  }
  return tx;
}
