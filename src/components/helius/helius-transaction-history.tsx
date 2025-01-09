import {
  useHeliusTransactions,
  useWeb3Transactions,
} from "./helius-data-access";
import { useCluster } from "../cluster/cluster-data-access";
import { ellipsify } from "../ui/ui-layout";

export function HeliusTransactionHistory() {
  const { data: heliusTransactions, isLoading: heliusLoading } =
    useHeliusTransactions();
  const { data: web3Transactions, isLoading: web3Loading } =
    useWeb3Transactions();
  const { cluster } = useCluster();

  if (heliusLoading || web3Loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="space-y-6">
      <div className="alert alert-info shadow-lg">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">Raw Transaction Data Comparison</h3>
            <p>
              Comparing raw transaction data from Web3.js vs Helius on{" "}
              {cluster.network}
            </p>
          </div>
        </div>
      </div>

      {web3Transactions?.map((web3Tx: any, index: number) => {
        const heliusTx = heliusTransactions?.[index];
        return (
          <div key={web3Tx.signature} className="grid grid-cols-2 gap-4">
            {/* Web3.js Raw Data */}
            <div className="card bg-neutral bg-opacity-10">
              <div className="card-body">
                <h3 className="card-title">Web3.js Raw Data</h3>
                <div className="space-y-2">
                  <div className="bg-base-300 bg-opacity-20 p-3 rounded text-sm">
                    <p>Signature: {ellipsify(web3Tx.signature)}</p>
                    <p>Fee: {web3Tx.fee / 1e9} SOL</p>
                    <div className="divider">Balance Changes</div>
                    {web3Tx.balanceChanges?.map((change: any, i: number) => (
                      <p key={i} className="font-mono text-xs">
                        Δ {change.change} SOL ({ellipsify(change.address)})
                      </p>
                    ))}

                    {/* Make Raw Instructions collapsible */}
                    <details className="mt-4" open>
                      <summary className="cursor-pointer font-semibold">
                        Raw Instructions
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-[500px] bg-base-200 p-2 rounded">
                        {JSON.stringify(web3Tx.instructions, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            {/* Helius Enhanced Data */}
            <div className="card bg-primary bg-opacity-10">
              <div className="card-body">
                <h3 className="card-title flex items-center gap-2">
                  {heliusTx?.type}
                  <span className="badge badge-primary badge-sm">
                    Helius Enhanced
                  </span>
                </h3>
                <div className="space-y-2">
                  <div className="bg-base-300 bg-opacity-20 p-3 rounded text-sm">
                    {/* Human Readable Description */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Human Readable:</h4>
                      <p className="text-base">{heliusTx?.description}</p>
                    </div>

                    {/* NFT Details (if present) */}
                    {heliusTx?.events?.compressed?.[0] && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">NFT Details:</h4>
                        <div className="space-y-1">
                          <p>
                            Name: {heliusTx.events.compressed[0].metadata?.name}
                          </p>
                          <p>
                            Asset ID:{" "}
                            {ellipsify(heliusTx.events.compressed[0].assetId)}
                          </p>
                          <p>
                            Owner:{" "}
                            {ellipsify(
                              heliusTx.events.compressed[0].newLeafOwner
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Token Transfers (if present) */}
                    {heliusTx?.tokenTransfers?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Token Transfers:</h4>
                        {heliusTx.tokenTransfers.map(
                          (transfer: any, i: number) => (
                            <p key={i} className="text-sm">
                              {transfer.tokenAmount}{" "}
                              {transfer.tokenName || "tokens"} →{" "}
                              {ellipsify(transfer.toUserAccount)}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {/* Native SOL Transfers */}
                    {heliusTx?.nativeTransfers?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">SOL Transfers:</h4>
                        {heliusTx.nativeTransfers.map(
                          (transfer: any, i: number) => (
                            <p key={i} className="text-sm">
                              {transfer.amount / 1e9} SOL:{" "}
                              {ellipsify(transfer.fromUserAccount)} →{" "}
                              {ellipsify(transfer.toUserAccount)}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {/* Update Raw Event Data section */}
                    <details className="mt-4" open>
                      <summary className="cursor-pointer font-semibold">
                        Raw Event Data
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-[500px] bg-base-200 p-2 rounded">
                        {JSON.stringify(heliusTx?.events, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
