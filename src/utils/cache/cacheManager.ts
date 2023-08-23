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
import { getNestedValue } from "@utils/helpers/getNestedValue"
import { type Cursor } from "baobab"
import Baobab from "baobab"
import dayjs from "dayjs"

export type StateTree = {
	lastCachedData: number | null
	lastCachedTokenPool: number | null
	poolList: Pool[]
	poolListWithData: PoolWithData[]
	tokenList: Token[]
}

export class CacheManager {
	private readonly tree: Baobab

	private readonly tokenListCursor: Cursor

	private readonly poolListCursor: Cursor

	private readonly poolListWithDataCursor: Cursor

	public constructor() {
		this.tree = new Baobab(
			{
				lastCachedData: null,
				lastCachedTokenPool: null,
				poolList: [],
				poolListWithData: [],
				tokenList: []
			},
			{
				asynchronous: true,
				monkeyBusiness: false
			}
		)

		// Initialize cursors
		this.tokenListCursor = this.tree.select("tokenList")
		this.poolListCursor = this.tree.select("poolList")
		this.poolListWithDataCursor = this.tree.select("poolListWithData")
		// Event listeners
		this.initializeEventListeners()

		console.log(welcomeStyle.Render("State Management Loaded."))
	}

	// 3. Add getters for poolListWithData
	public getPoolListWithData = (): PoolWithData[] => {
		return this.poolListWithDataCursor.get()
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

	public updateCachedTokensAndPools = async () => {
		try {
			// Parallel Network Requests
			const [tokenListResponse, poolListResponse] = await Promise.all([
				fetch(tokenListUrl),
				fetch(poolListUrl)
			])

			const tokenListJson: TokenListResponse = await tokenListResponse.json()
			const poolListJson: PoolListResponse = await poolListResponse.json()

			this.tokenListCursor.set(tokenListJson.tokens)
			this.poolListCursor.set(poolListJson.pools)

			// Update the timestamp after successfully updating the cache
			this.tree.set("lastCachedTokenPool", Date.now())
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("An error occurred:", error)
			throw new GeneralError()
		}
	}

	public updateCachedData = async () => {
		try {
			// Parallel Network Requests
			const poolsWithData = await getPoolListWithData()

			this.poolListWithDataCursor.set(poolsWithData.pools)

			// Update the timestamp after successfully updating the cache
			this.tree.set("lastCachedData", Date.now())
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("An error occurred:", error)
			throw new GeneralError()
		}
	}

	public getTimeSinceLastTokenAndPoolCache(): number | null {
		return this.tree.get("lastCachedTokenPool")
	}

	public getTimeSinceLastDataCache(): number | null {
		return this.tree.get("lastCachedData")
	}

	private initializeEventListeners() {
		// Logging Updates to Token and Pool Lists
		this.tokenListCursor.on("update", () => {
			console.log(successStyle.Render("Token List Updated!"))
		})

		this.poolListCursor.on("update", async () => {
			await refreshData()
			console.log(successStyle.Render("Pool List Updated!"))
		})

		this.poolListWithDataCursor.on("update", () => {
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
	}
}

// Create the CacheManager instance
export const cacheManagerInstance = new CacheManager()
