import { useState, useEffect } from "react";
import { useTimeLockedWallet } from "@/services/timeLockedWalletService";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Toaster } from "react-hot-toast";

export default function TimeLockedWallet() {
  const { connected } = useWallet();
  const { createWallet, deposit, withdraw, closeWallet, getWalletData } =
    useTimeLockedWallet();

  const [walletData, setWalletData] = useState<any>(null);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<number>(0.1);
  const [loading, setLoading] = useState<boolean>(false);

  // Convert date input to Unix timestamp
  const dateToTimestamp = (dateString: string) => {
    return Math.floor(new Date(dateString).getTime() / 1000);
  };

  // Convert Unix timestamp to readable date
  const timestampToDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleCreateWallet = async () => {
    if (!releaseDate) return;

    setLoading(true);
    try {
      const timestamp = dateToTimestamp(releaseDate);
      await createWallet(timestamp);
      await refreshWalletData();
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount <= 0) return;

    setLoading(true);
    try {
      // Convert SOL to lamports
      const lamports = depositAmount * LAMPORTS_PER_SOL;
      await deposit(lamports);
      await refreshWalletData();
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdraw();
      await refreshWalletData();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWallet = async () => {
    setLoading(true);
    try {
      await closeWallet();
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    const data = await getWalletData();
    setWalletData(data);
  };

  // Check if release time has passed
  const isReleaseTimePassed = () => {
    if (!walletData) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= walletData.releaseTime;
  };

  // Format SOL balance
  const formatSolBalance = (lamports: number) => {
    return (lamports / LAMPORTS_PER_SOL).toFixed(6);
  };

  // Fetch wallet data on component mount and when connection status changes
  useEffect(() => {
    if (connected) {
      refreshWalletData();
    } else {
      setWalletData(null);
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center p-6 bg-base-200 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Time-Locked Wallet</h2>
        <p>Connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-base-200 rounded-lg shadow-md">
      <Toaster position="bottom-right" />
      <h2 className="text-xl font-bold mb-4">Time-Locked Wallet</h2>

      {!walletData ? (
        <div className="flex flex-col gap-4">
          <p>Create a new time-locked wallet:</p>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Release Date</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={handleCreateWallet}
            disabled={loading || !releaseDate}
          >
            {loading ? "Creating..." : "Create Wallet"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="font-semibold">Wallet Address:</span>
              <span className="text-xs truncate">
                {walletData.address.toString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Balance:</span>
              <span>{formatSolBalance(walletData.balance)} SOL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Release Date:</span>
              <span>{timestampToDate(walletData.releaseTime)}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Status:</span>
              <span
                className={
                  isReleaseTimePassed() ? "text-success" : "text-error"
                }
              >
                {isReleaseTimePassed() ? "Unlocked" : "Locked"}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Deposit Amount (SOL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input input-bordered w-full"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                step="0.01"
                min="0"
              />
              <button
                className="btn btn-primary"
                onClick={handleDeposit}
                disabled={loading || depositAmount <= 0}
              >
                {loading ? "Depositing..." : "Deposit"}
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              className="btn btn-secondary flex-1"
              onClick={handleWithdraw}
              disabled={loading || !isReleaseTimePassed()}
            >
              {loading ? "Withdrawing..." : "Withdraw"}
            </button>
            <button
              className="btn btn-error flex-1"
              onClick={handleCloseWallet}
              disabled={loading || walletData.balance > 0}
            >
              {loading ? "Closing..." : "Close Wallet"}
            </button>
          </div>

          <button
            className="btn btn-outline mt-2"
            onClick={refreshWalletData}
            disabled={loading}
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}
