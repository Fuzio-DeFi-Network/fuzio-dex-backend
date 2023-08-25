import { contracts } from "@fuzio/contracts"
import { type Pool } from "@type/model"
import { client } from "@utils/clients/cosmWasmClient"
import { poolListUrl, stablePoolId } from "@utils/constants"
import { BigNumber } from "bignumber.js"

const {
	FuzioPool: { FuzioPoolQueryClient }
} = contracts

export const getBaseTokenPrice = async () => {
	try {
		const poolListResponse = await fetch(poolListUrl)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const poolListJson: any = await poolListResponse.json()
		const poolList: Pool[] = poolListJson.pools.map((pool: Pool) => {
			return pool
		})

		if (poolList.length === 0) {
			return BigNumber(0)
		}

		const poolQueryClient = new FuzioPoolQueryClient(
			client,
			poolList[stablePoolId].swapAddress
		)

		const poolInfo = await poolQueryClient.info()

		const fuzioPrice = BigNumber(poolInfo.token2_reserve).dividedBy(
			BigNumber(poolInfo.token1_reserve)
		)

		return fuzioPrice
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("An error occurred:", error)
		throw error
	}
}
