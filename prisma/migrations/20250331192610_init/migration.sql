-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('TELEGRAM', 'TWITTER');

-- CreateEnum
CREATE TYPE "TokenPlatform" AS ENUM ('GMGN', 'COIN_GECKO', 'DEX_SCREENER', 'PHOTON', 'AXIOM', 'BIRDEYE');

-- CreateEnum
CREATE TYPE "TokenRelationshipType" AS ENUM ('TOP_HOLDER', 'EARLY_BUYER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SWAP', 'TRANSFER', 'MINT', 'BURN');

-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chain_id" TEXT NOT NULL,
    "native_token_address" TEXT NOT NULL,
    "wrapped_token_address" TEXT,
    "usdt_address" TEXT,
    "usdc_address" TEXT,
    "dai_address" TEXT,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "created_by" TEXT,
    "creation_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "decimals" INTEGER NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "telegram_url" TEXT,
    "twitter_url" TEXT,
    "discord_url" TEXT,
    "reddit_url" TEXT,
    "github_url" TEXT,
    "description" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletSwaps" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "amount_in" DOUBLE PRECISION NOT NULL,
    "amount_out" DOUBLE PRECISION NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "hash" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletSwaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransactions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "value_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WalletTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidityPool" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "base_token_address" TEXT NOT NULL,
    "vault_address" TEXT,
    "quote_token_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiquidityPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackedWallet" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenRelationship" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "TokenRelationshipType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenHolding" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TokenHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletPerformance" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,
    "win_rate" DOUBLE PRECISION NOT NULL,
    "chain_id" TEXT NOT NULL,

    CONSTRAINT "WalletPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenDistribution" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "top_10_holder_rate" DOUBLE PRECISION NOT NULL,
    "top_20_holder_rate" DOUBLE PRECISION NOT NULL,
    "creator_token_rate" DOUBLE PRECISION NOT NULL,
    "creator_wallet_address" TEXT NOT NULL,
    "bundle_rate" DOUBLE PRECISION NOT NULL,
    "chain_id" TEXT NOT NULL,
    "wallet_to_balance_map" JSONB NOT NULL,
    "fresh_wallets" TEXT[],
    "same_balance_wallets" TEXT[],
    "locked_wallets" TEXT[],
    "bundled_wallets" TEXT[],
    "clusters" JSONB NOT NULL,

    CONSTRAINT "TokenDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingToken" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "platform" "TokenPlatform" NOT NULL,
    "chain_id" TEXT NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TrendingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialChannel" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "id_on_platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "wallet_id" TEXT,
    "wallet_address" TEXT,

    CONSTRAINT "SocialChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TokenDistributionToWallet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Chain_id_key" ON "Chain"("id");

-- CreateIndex
CREATE INDEX "Chain_chain_id_idx" ON "Chain"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_id_key" ON "Token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_chain_id_key" ON "Token"("address", "chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_chain_id_key" ON "Wallet"("address", "chain_id");

-- CreateIndex
CREATE INDEX "TrackedWallet_wallet_id_idx" ON "TrackedWallet"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedWallet_wallet_id_address_chain_id_key" ON "TrackedWallet"("wallet_id", "address", "chain_id");

-- CreateIndex
CREATE INDEX "TokenHolding_token_id_idx" ON "TokenHolding"("token_id");

-- CreateIndex
CREATE INDEX "TokenHolding_wallet_id_idx" ON "TokenHolding"("wallet_id");

-- CreateIndex
CREATE INDEX "WalletPerformance_wallet_id_idx" ON "WalletPerformance"("wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "_TokenDistributionToWallet_AB_unique" ON "_TokenDistributionToWallet"("A", "B");

-- CreateIndex
CREATE INDEX "_TokenDistributionToWallet_B_index" ON "_TokenDistributionToWallet"("B");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletSwaps" ADD CONSTRAINT "WalletSwaps_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletSwaps" ADD CONSTRAINT "WalletSwaps_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransactions" ADD CONSTRAINT "WalletTransactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransactions" ADD CONSTRAINT "WalletTransactions_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidityPool" ADD CONSTRAINT "LiquidityPool_token_address_fkey" FOREIGN KEY ("token_address") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedWallet" ADD CONSTRAINT "TrackedWallet_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedWallet" ADD CONSTRAINT "TrackedWallet_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenRelationship" ADD CONSTRAINT "TokenRelationship_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenRelationship" ADD CONSTRAINT "TokenRelationship_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenHolding" ADD CONSTRAINT "TokenHolding_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenHolding" ADD CONSTRAINT "TokenHolding_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletPerformance" ADD CONSTRAINT "WalletPerformance_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletPerformance" ADD CONSTRAINT "WalletPerformance_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenDistribution" ADD CONSTRAINT "TokenDistribution_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenDistribution" ADD CONSTRAINT "TokenDistribution_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingToken" ADD CONSTRAINT "TrendingToken_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingToken" ADD CONSTRAINT "TrendingToken_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialChannel" ADD CONSTRAINT "SocialChannel_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TokenDistributionToWallet" ADD CONSTRAINT "_TokenDistributionToWallet_A_fkey" FOREIGN KEY ("A") REFERENCES "TokenDistribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TokenDistributionToWallet" ADD CONSTRAINT "_TokenDistributionToWallet_B_fkey" FOREIGN KEY ("B") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
