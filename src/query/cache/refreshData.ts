import { cacheManagerInstance } from "@utils/cache"

export const refreshData = async (): Promise<void> => {
	const timeSinceLastUpdate = cacheManagerInstance.getTimeSinceLastDataCache()

	// If the cache has never been updated or it's been more than 5 minutes since the last update
	if (timeSinceLastUpdate === null || timeSinceLastUpdate > 5 * 60 * 1_000) {
		await cacheManagerInstance.updateCachedData()
	}
}
