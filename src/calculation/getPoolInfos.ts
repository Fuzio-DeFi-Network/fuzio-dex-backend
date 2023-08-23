import { type CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { contracts } from "@fuzio/contracts"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type Pool } from "@type/model"

export const getPoolInfos = async (
	client: CosmWasmClient,
	poolList: Pool[]
): Promise<InfoResponse[]> => {
	const {
		FuzioPool: { FuzioPoolQueryClient }
	} = contracts
	const poolQueries = poolList.map(async (pool) => {
		const poolQueryClient = new FuzioPoolQueryClient(client, pool.swapAddress)
		return await poolQueryClient.info()
	})
	return await Promise.all(poolQueries)
}
