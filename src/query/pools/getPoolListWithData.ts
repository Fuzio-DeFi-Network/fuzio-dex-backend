import { CacheManagerError } from "@errors/CacheManagerError"
import { UnexpectedPoolStructureError } from "@errors/UnexpectedPoolStructureError"
import { getBaseTokenPrice } from "@query/price"
import { cacheManagerInstance } from "@utils/cache"
import { client } from "@utils/clients/cosmWasmClient"
import { BigNumber } from "bignumber.js"
import { calculateHighestMetrics } from "calculation/calculateHighestMetrics"
import { calculatePoolData } from "calculation/calculatePoolData"
import { getPoolInfos } from "calculation/getPoolInfos"

export const getPoolListWithData = async () => {
	BigNumber.config({
		DECIMAL_PLACES: 18,
		EXPONENTIAL_AT: 18,
		ROUNDING_MODE: 1
	})

	try {
		// Use CacheManager to get the pool and token lists
		const poolList = cacheManagerInstance.getPoolList()
		const tokenList = cacheManagerInstance.getTokenList()

		if (!poolList.length || !tokenList.length) {
			await cacheManagerInstance.updateCachedData()
		}

		if (poolList.length === 0) {
			return {
				highestAprPool: 0,
				highestLiquidity: 0,
				pools: []
			}
		}

		const baseTokenPrice = await getBaseTokenPrice()
		const poolInfos = await getPoolInfos(client, poolList)
		const poolsWithData = await calculatePoolData(
			poolList,
			poolInfos,
			baseTokenPrice,
			client
		)
		const { highestApr, highestLiquidity } = await calculateHighestMetrics(
			poolsWithData
		)

		return {
			highestApr,
			highestLiquidity,
			pools: poolsWithData
		}
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
