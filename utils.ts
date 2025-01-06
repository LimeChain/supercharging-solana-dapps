import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

export async function loadKeypairFromFile(
  path: string = require("os").homedir() + "/.config/solana/id.json"
): Promise<Keypair> {
  const keypairFile = fs.readFileSync(path);
  const secretKey = Uint8Array.from(JSON.parse(keypairFile.toString()));
  return Keypair.fromSecretKey(secretKey);
}
