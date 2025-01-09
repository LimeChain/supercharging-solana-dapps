"use client";

import { useState } from "react";
import { HeliusTransactionHistory } from "@/components/helius/helius-transaction-history";
import { DASExample } from "@/components/helius/das-example";
import { MintListExample } from "@/components/helius/mint-list-example";
import { AppHero } from "@/components/ui/ui-layout";

export default function HeliusExamplesPage() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div>
      <AppHero
        title="Helius Integration Examples"
        subtitle="Explore different Helius API capabilities"
      />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${
              activeTab === "transactions" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transaction Parsing
          </a>
          <a
            className={`tab ${activeTab === "nfts" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("nfts")}
          >
            NFT Holdings (DAS)
          </a>
          <a
            className={`tab ${activeTab === "mints" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("mints")}
          >
            Mint List
          </a>
        </div>

        {activeTab === "transactions" && <HeliusTransactionHistory />}
        {activeTab === "nfts" && <DASExample />}
        {activeTab === "mints" && <MintListExample />}
      </div>
    </div>
  );
}
