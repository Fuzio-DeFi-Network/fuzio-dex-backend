import { GeneralError } from "@errors/GeneralError"
import { PoolListFetchError } from "@errors/PoolListFetchError"
import { type Pool } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"

export const getPoolList = async (): Promise<Pool[]> => {
	try {
		// Ensure data is fetched and cached
		if (!cacheManagerInstance.getPoolList().length) {
			await cacheManagerInstance.updateCachedData()
		}

		return cacheManagerInstance.getPoolList()
	} catch (error) {
		if (error instanceof PoolListFetchError) {
			console.error(error.message)
			throw error
		} else {
			console.error("An unexpected error occurred:", error)
			throw new GeneralError()
		}
	}
}
