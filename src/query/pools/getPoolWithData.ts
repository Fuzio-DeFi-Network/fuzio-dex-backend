import { CacheManagerError } from "@errors/CacheManagerError"
import { UnexpectedPoolStructureError } from "@errors/UnexpectedPoolStructureError"
import { getBaseTokenPrice } from "@query/price"
import { type PoolKeys } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"
import { client } from "@utils/clients/cosmWasmClient"
import { BigNumber } from "bignumber.js"
import { calculatePoolData } from "calculation/calculatePoolData"
import { getPoolInfos } from "calculation/getPoolInfos"

export const getPoolWithData = async (property: PoolKeys, value: string) => {
	BigNumber.config({
		DECIMAL_PLACES: 18,
		EXPONENTIAL_AT: 18,
		ROUNDING_MODE: 1
	})

	try {
		// Use CacheManager to get the pool by property
		const pool = cacheManagerInstance.getPoolByProperty(property, value)
		const tokenList = cacheManagerInstance.getTokenList()

		if (!pool || !tokenList.length) {
			await cacheManagerInstance.updateCachedData()
		}

		if (!pool) {
			throw new Error("Pool not found.")
		}

		const baseTokenPrice = await getBaseTokenPrice()
		const poolInfos = await getPoolInfos(client, [pool])
		const poolWithData = await calculatePoolData(
			[pool],
			poolInfos,
			baseTokenPrice,
			client
		)

		return poolWithData[0] // Since we're working with a single pool, we return the first item
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("An error occurred:", error)
		if (error instanceof UnexpectedPoolStructureError) {
			throw error
		} else {
			throw new CacheManagerError("Failed to fetch or process pool data.")
		}
	}
}
