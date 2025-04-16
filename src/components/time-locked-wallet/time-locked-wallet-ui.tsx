"use client";

import { useTimeLockedWallet } from "./time-locked-wallet-data-access";
import { useState } from "react";

export function CreateWallet() {
  const { createWallet } = useTimeLockedWallet();
  const [releaseTime, setReleaseTime] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <input
        type="datetime-local"
        className="input input-bordered"
        value={releaseTime}
        onChange={(e) => setReleaseTime(e.target.value)}
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={() => {
          const timestamp = Math.floor(new Date(releaseTime).getTime() / 1000);
          createWallet.mutateAsync(timestamp);
        }}
        disabled={createWallet.isPending || !releaseTime}
      >
        Create Wallet{createWallet.isPending && "..."}
      </button>
    </div>
  );
}

export function WalletProgram() {
  const { getProgramAccount } = useTimeLockedWallet();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  // Check if data exists - Gill returns the value directly now
  if (!getProgramAccount.data) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  // Custom replacer to handle BigInt serialization
  const bigIntReplacer = (key: string, value: any) => {
    // Convert BigInt to string representation
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };

  return (
    <div className={"space-y-6"}>
      <pre>{JSON.stringify(getProgramAccount.data, bigIntReplacer, 2)}</pre>
    </div>
  );
}

export function DepositForm() {
  const { deposit } = useTimeLockedWallet();
  const [amount, setAmount] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <input
        type="number"
        className="input input-bordered"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in SOL"
      />
      <button
        className="btn btn-primary"
        onClick={() => deposit.mutateAsync({ amount: parseFloat(amount) })}
        disabled={deposit.isPending || !amount}
      >
        Deposit{deposit.isPending && "..."}
      </button>
    </div>
  );
}

export function WithdrawButton() {
  const { withdraw } = useTimeLockedWallet();

  return (
    <button
      className="btn btn-warning"
      onClick={() => withdraw.mutateAsync()}
      disabled={withdraw.isPending}
    >
      Withdraw{withdraw.isPending && "..."}
    </button>
  );
}

export function CloseWalletButton() {
  const { closeWallet } = useTimeLockedWallet();

  return (
    <button
      className="btn btn-error"
      onClick={() => closeWallet.mutateAsync()}
      disabled={closeWallet.isPending}
    >
      Close Wallet{closeWallet.isPending && "..."}
    </button>
  );
}
