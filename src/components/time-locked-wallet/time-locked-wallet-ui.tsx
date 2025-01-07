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
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}
