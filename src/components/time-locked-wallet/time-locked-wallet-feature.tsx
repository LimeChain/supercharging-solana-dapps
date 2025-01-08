"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ExplorerLink } from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { useTimeLockedWallet } from "./time-locked-wallet-data-access";
import {
  CreateWallet,
  WalletProgram,
  DepositForm,
  WithdrawButton,
  CloseWalletButton,
} from "./time-locked-wallet-ui";

export default function TimeLockedWalletFeature() {
  const { publicKey } = useWallet();
  const { programId } = useTimeLockedWallet();

  return publicKey ? (
    <div>
      <AppHero
        title="Time Locked Wallet"
        subtitle={
          "Create a new time-locked wallet by selecting a release time."
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <div className="flex flex-col gap-6">
          <CreateWallet />
          <DepositForm />
          <div className="flex gap-4">
            <WithdrawButton />
            <CloseWalletButton />
          </div>
        </div>
      </AppHero>
      <WalletProgram />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
