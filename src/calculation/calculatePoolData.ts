/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateBondingPeriods } from "./calculateBondingPeriods"
import { calculatePoolTokenPrices } from "./calculatePoolTokenPrices"
import { getHighestApr } from "./getHighestApr"
import { type CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { CacheManagerError } from "@errors/CacheManagerError"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type HighestAPR, type Pool, type PoolWithData } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"
import { convertDenomToMicroDenom, convertMicroDenomToDenom } from "@utils/math"
import { BigNumber } from "bignumber.js"

export const calculatePoolData = async (
	poolList: Pool[],
	poolInfos: InfoResponse[],
	baseTokenPrice: BigNumber,
	client: CosmWasmClient
): Promise<PoolWithData[]> => {
	const poolsWithData: PoolWithData[] = []

	for await (const [index, poolInfo] of poolInfos.entries()) {
		const token1 = cacheManagerInstance.getTokenByProperty(
			"denom",
			Object.values(poolInfo.token1_denom)[0] as string
		)
		const token2 = cacheManagerInstance.getTokenByProperty(
			"denom",
			Object.values(poolInfo.token2_denom)[0] as string
		)

		if (!token1 || !token2) {
			throw new CacheManagerError("Token not found in cache.")
		}

		const tokenOneReserveDenom = BigNumber(poolInfo.token1_reserve).dividedBy(
			convertDenomToMicroDenom(10, token1.decimal)
		)

		const tokenTwoReserveDenom = BigNumber(poolInfo.token2_reserve).dividedBy(
			convertDenomToMicroDenom(10, token2.decimal)
		)

		const { tokenOnePrice, tokenTwoPrice } = calculatePoolTokenPrices(
			poolInfo,
			baseTokenPrice,
			token1,
			token2
		)

		const bondingPeriods = await calculateBondingPeriods(
			client,
			poolList[index],
			poolInfo,
			tokenOnePrice,
			tokenTwoPrice,
			token1,
			token2
		)

		let highestAPR: HighestAPR | undefined = {
			highestAprToken: undefined,
			highestAprValue: 0
		}

		for (const period of bondingPeriods ?? []) {
			if (period.rewards) {
				highestAPR = getHighestApr(period.rewards, highestAPR)
			}
		}

		const pool = poolList[index]

		const poolWithData: PoolWithData = {
			...pool,
			bondingPeriods: bondingPeriods ?? undefined,
			highestAPR,
			liquidity: {
				token1: {
					amount: poolInfo.token1_reserve,
					denom: pool.liquidity.token1.denom,
					tokenPrice: tokenOnePrice.toString()
				},
				token2: {
					amount: poolInfo.token2_reserve,
					denom: pool.liquidity.token2.denom,
					tokenPrice: tokenTwoPrice.toString()
				},
				usd: convertMicroDenomToDenom(
					tokenOnePrice.multipliedBy(poolInfo.token1_reserve),
					token1.decimal
				)
					.plus(
						convertMicroDenomToDenom(
							tokenTwoPrice.multipliedBy(poolInfo.token2_reserve),
							token2.decimal
						)
					)
					.toString()
			},
			lpTokenAddress: poolInfo.lp_token_address,
			lpTokens: convertMicroDenomToDenom(
				poolInfo.lp_token_supply,
				6
			).toString(),
			poolId: index + 1,
			ratio: tokenTwoReserveDenom.dividedBy(tokenOneReserveDenom).toString(),
			swapAddress: poolList[index].swapAddress
		}

		poolsWithData.push(poolWithData)
	}

	return poolsWithData
}
