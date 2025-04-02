import { ChainType } from "@prisma/client"
import { Database } from "../lib/db/database"
import { ChainsMap, isEvmChainId } from "../shared/chains"

export const createChains = async () => {
    const db = Database.getInstance()
    const chains = Object.entries(ChainsMap).map(([chain, chainID]) => ({
        name: chain,
        chain_type: isEvmChainId(chainID) ? ChainType.EVM : ChainType.SOLANA,
        created_at: new Date(),
        updated_at: new Date(),
        chain_id: chainID,
        native_token_address: isEvmChainId(chainID) ? "0x0000000000000000000000000000000000000000" : "So11111111111111111111111111111111111111112",
    }))
    await db.chains.createMany(chains)
}

createChains()