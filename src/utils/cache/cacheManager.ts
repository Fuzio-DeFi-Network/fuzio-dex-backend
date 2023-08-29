import { GeneralError } from "@errors/GeneralError"
import { refreshData } from "@query/cache/refreshData"
import { getPoolListWithData } from "@query/pools"
import {
	type Pool,
	type PoolKeys,
	type PoolWithData,
	type PoolWithDataKeys,
	type Token,
	type TokenKeys
} from "@type/model"
import { type PoolListResponse, type TokenListResponse } from "@type/response"
import { logStyle, successStyle, welcomeStyle } from "@utils/cli/styles"
import { poolListUrl, tokenListUrl } from "@utils/constants"
import { fetchWithRetry } from "@utils/helpers/fetchWithRetry"
import { getNestedValue } from "@utils/helpers/getNestedValue"
import { type Cursor } from "baobab"
import Baobab from "baobab"
import dayjs from "dayjs"

export type StateTree = {
	cacheInitialized: boolean
	highestAPR: PoolWithData | undefined
	highestLiq: PoolWithData | undefined
	lastCachedData: number | null
	lastCachedTokenPool: number | null
	poolList: Pool[]
	poolListWithData: PoolWithData[]
	tokenList: Token[]
}

const initialState: StateTree = {
	cacheInitialized: false,
	highestAPR: undefined,
	highestLiq: undefined,
	lastCachedData: null,
	lastCachedTokenPool: null,
	poolList: [],
	poolListWithData: [],
	tokenList: []
}

export class CacheManager {
	private readonly tree: Baobab

	private readonly tokenListCursor: Cursor

	private readonly poolListCursor: Cursor

	private readonly poolListWithDataCursor: Cursor

	private readonly highestAprCursor: Cursor

	private readonly highestLiqCursor: Cursor

	private readonly newestPoolCursor: Cursor

	public constructor() {
		this.tree = new Baobab(initialState, {
			asynchronous: true,
			monkeyBusiness: false
		})

		// Initialize cursors
		this.tokenListCursor = this.tree.select("tokenList")
		this.poolListCursor = this.tree.select("poolList")
		this.poolListWithDataCursor = this.tree.select("poolListWithData")
		this.highestAprCursor = this.tree.select("highestAPR")
		this.highestLiqCursor = this.tree.select("highestLiq")
		this.newestPoolCursor = this.tree.select("newestPool")

		// Initialize Event listeners
		this.initializeEventListeners()
	}

	// Add getters for poolListWithData
	public getPoolListWithData = (): PoolWithData[] => {
		return this.poolListWithDataCursor.get()
	}

	public getHighestLiquidityPool = (): PoolWithData => {
		return this.highestLiqCursor.get()
	}

	public getHighestAPRPool = (): PoolWithData => {
		return this.highestAprCursor.get()
	}

	public getNewestPool = (): PoolWithData => {
		return this.newestPoolCursor.get()
	}

	public getPoolWithDataByIndex = (index: number): PoolWithData => {
		return this.poolListWithDataCursor.select(index).get()
	}

	public getPoolsWithDataByDenom = (denom: string): PoolWithData[] => {
		return this.poolListWithDataCursor
			.select((currentPoolWithData) => {
				return (
					currentPoolWithData.liquidity.token1.denom === denom ||
					currentPoolWithData.liquidity.token2.denom === denom
				)
			})
			.get()
	}

	public getTokenList = (): Token[] => {
		return this.tokenListCursor.get()
	}

	// Pool related getters
	public getPoolList = (): Pool[] => {
		return this.poolListCursor.get()
	}

	public getPoolByIndex = (index: number): Pool => {
		return this.poolListCursor.select(index).get()
	}

	public getPoolsByDenom = (denom: string): Pool[] => {
		return this.poolListCursor
			.select((currentPool) => {
				return (
					currentPool.liquidity.token1.denom === denom ||
					currentPool.liquidity.token2.denom === denom
				)
			})
			.get()
	}

	public getPoolByProperty = (property: PoolKeys, value: string): Pool => {
		const pool = this.poolListCursor
			.select((currentPool) => {
				return getNestedValue(currentPool, property) === value
			})
			.get() as Pool

		return pool ?? undefined
	}

	public getPoolWithDataByProperty = (
		property: PoolWithDataKeys,
		value: string
	): PoolWithData => {
		const pool = this.poolListWithDataCursor
			.select((currentPoolWithData) => {
				return getNestedValue(currentPoolWithData, property) === value
			})
			.get() as PoolWithData

		return pool ?? undefined
	}

	public getAllPoolsWithDataByProperty = (
		property: PoolWithDataKeys,
		value: string
	): PoolWithData[] => {
		const pools = this.getPoolListWithData()

		// Then, filter out the ones that match the given property and value
		const matchingPools = pools.filter(
			(pool) => getNestedValue(pool, property) === value
		)

		return matchingPools
	}

	// Token related getters
	public getTokenByIndex = (index: number): Token => {
		return this.tokenListCursor.select(index).get()
	}

	public getTokenByProperty = (property: TokenKeys, value: string): Token => {
		const token = this.tokenListCursor
			.select((currentToken) => {
				return currentToken[property] === value
			})
			.get() as Token

		return token ?? undefined
	}

	public getTokenPrice = (denom: string): string | undefined => {
		// Ensure data is available before proceeding
		if (
			this.getTimeSinceLastDataCache() === null ||
			this.getPoolListWithData().length === 0
		) {
			return undefined
		}

		const poolsWithTokenAsOne = this.getAllPoolsWithDataByProperty(
			"liquidity.token1.denom",
			denom
		)

		const poolsWithTokenAsTwo = this.getAllPoolsWithDataByProperty(
			"liquidity.token2.denom",
			denom
		)

		const poolsWithToken = [...poolsWithTokenAsOne, ...poolsWithTokenAsTwo]

		// If no pools have the token, return undefined
		if (poolsWithToken.length === 0) {
			return undefined
		}

		// Find a pool that has the token's price
		for (const pool of poolsWithToken) {
			if (
				pool.liquidity.token1.denom === denom &&
				pool.liquidity.token1.tokenPrice
			) {
				return pool.liquidity.token1.tokenPrice
			}

			if (
				pool.liquidity.token2.denom === denom &&
				pool.liquidity.token2.tokenPrice
			) {
				return pool.liquidity.token2.tokenPrice
			}
		}

		// If none of the pools had the token's price, return undefined
		return undefined
	}

	public fetchTokensAndPools = async () => {
		try {
			const [tokenListResponse, poolListResponse] = await Promise.all([
				fetchWithRetry(tokenListUrl),
				fetchWithRetry(poolListUrl)
			])

			const tokenListJson: TokenListResponse = await tokenListResponse.json()
			const poolListJson: PoolListResponse = await poolListResponse.json()

			this.tokenListCursor.set(tokenListJson.tokens)
			this.poolListCursor.set(poolListJson.pools)

			// Update the timestamp after successfully updating the cache
			this.tree.set("lastCachedTokenPool", Date.now())
		} catch (error) {
			console.error("An error occurred while fetching tokens and pools:", error)
			throw new GeneralError()
		}
	}

	public fetchPoolData = async () => {
		try {
			const poolsWithData = await getPoolListWithData()

			this.poolListWithDataCursor.set(poolsWithData.pools)
			this.highestAprCursor.set(poolsWithData.highestApr)
			this.highestLiqCursor.set(poolsWithData.highestLiquidity)
			this.newestPoolCursor.set(
				poolsWithData.pools[poolsWithData.pools.length - 1]
			)

			// Update the timestamp after successfully updating the cache
			this.tree.set("lastCachedData", Date.now())
		} catch (error) {
			console.error("An error occurred while fetching pool data:", error)
			throw new GeneralError()
		}
	}

	public updateCachedTokensAndPools = async () => {
		try {
			await this.fetchTokensAndPools()
		} catch (error) {
			console.error("An error occurred in updateCachedTokensAndPools:", error)
			// You can decide to re-throw or handle it differently here.
		}
	}

	public updateCachedData = async () => {
		try {
			await this.fetchPoolData()
			if (!this.tree.select("cacheInitialized").get()) {
				this.tree.select("cacheInitialized").set(true)
				await this.fetchPoolData()
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("An error occurred:", error)
			throw new GeneralError()
		}
	}

	public getTimeSinceLastTokenAndPoolCache(): number | null {
		const lastCachedTime = this.tree.get("lastCachedTokenPool")
		if (lastCachedTime) {
			return Date.now() - lastCachedTime
		}

		return null
	}

	public getTimeSinceLastDataCache(): number | null {
		const lastCachedTime = this.tree.get("lastCachedData")
		if (lastCachedTime) {
			return Date.now() - lastCachedTime
		}

		return null
	}

	private initializeEventListeners() {
		this.poolListCursor.on("update", async () => {
			await refreshData()
			console.log(successStyle.Render("Token & Pool List Updated!"))
		})

		this.poolListWithDataCursor.on("update", () => {
			this.poolListWithDataCursor.get()
			console.log(successStyle.Render("Pool Data Updated!"))
		})

		// Logging Last Updated Timestamp Changes
		this.tree.select("lastCachedData").on("update", (event) => {
			console.log(
				logStyle.Render(
					`Data cache last updated at: ${dayjs(event.data.currentData).unix()}`
				)
			)
		})

		// Logging Last Updated Timestamp Changes
		this.tree.select("lastCachedTokenPool").on("update", (event) => {
			console.log(
				logStyle.Render(
					`Token & Pool list cache last updated at: ${dayjs(
						event.data.currentData
					).unix()}`
				)
			)
		})

		this.tree.select("cacheInitialized").on("update", async () => {
			console.log(welcomeStyle.Render("State Management Loaded."))
		})
	}
}

// Create the CacheManager instance
export const cacheManagerInstance = new CacheManager()
