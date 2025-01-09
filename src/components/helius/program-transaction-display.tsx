export function ProgramTransactionDisplay({
  transaction,
  isHelius,
}: {
  transaction: any;
  isHelius: boolean;
}) {
  if (isHelius) {
    // Helius enhanced view
    return (
      <div className="space-y-4">
        <div className="text-lg font-bold">{transaction.type}</div>
        <div>{transaction.description}</div>
        {transaction.events?.map((event: any, i: number) => (
          <div key={i} className="bg-base-200 p-4 rounded">
            <div className="font-semibold">{event.type}</div>
            <div className="text-sm opacity-75">{event.description}</div>
          </div>
        ))}
      </div>
    );
  }

  // Devnet enhanced view
  return (
    <div className="space-y-4">
      <div className="text-lg font-bold">Program Interaction</div>

      {/* Program Calls */}
      <div className="bg-base-200 p-4 rounded">
        <h3 className="font-semibold mb-2">Instructions</h3>
        {transaction.programCalls.map((call: any, i: number) => (
          <div key={i} className="mb-2">
            <div className="text-sm font-medium">{call.instruction}</div>
            <div className="text-xs opacity-75">
              Accounts:{" "}
              {call.accounts.map((a) => a.slice(0, 4) + "...").join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Balance Changes */}
      <div className="bg-base-200 p-4 rounded">
        <h3 className="font-semibold mb-2">Balance Changes</h3>
        {transaction.changes.map((change: any, i: number) => (
          <div key={i} className="text-sm">
            {change.change > 0 ? "+" : ""}
            {change.change} SOL ({change.address.slice(0, 4)}...)
          </div>
        ))}
      </div>
    </div>
  );
}
