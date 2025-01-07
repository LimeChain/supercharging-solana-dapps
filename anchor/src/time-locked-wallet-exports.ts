import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import TimeLockedWalletIDL from "../target/idl/time_locked_wallet.json";
import type { TimeLockedWallet } from "../target/types/time_locked_wallet";

export { TimeLockedWallet, TimeLockedWalletIDL };

export const TIME_LOCKED_WALLET_PROGRAM_ID = new PublicKey(
  TimeLockedWalletIDL.address
);

export function getTimeLockedWalletProgram(provider: AnchorProvider) {
  return new Program(TimeLockedWalletIDL as TimeLockedWallet, provider);
}
