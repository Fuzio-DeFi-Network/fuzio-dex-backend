import { calculateRewardsPerBlock } from "./calculateRewardsPerBlock"
import { contracts } from "@fuzio/contracts"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type Token } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"
import { client } from "@utils/clients/cosmWasmClient"
import { convertMicroDenomToDenom } from "@utils/math"
import { BigNumber } from "bignumber.js"

const {
	Cw20: { Cw20QueryClient }
} = contracts

export const calculateAPR = async (
	rewardDenom: string,
	startTime: number,
	endTime: number,
	rewardAmount: string,
	bondingPeriodAddress: string,
	lpTokenAddress: string,
	poolInfo: InfoResponse,
	tokenOnePrice: BigNumber,
	tokenTwoPrice: BigNumber,
	token1: Token,
	token2: Token
) => {
	try {
		const BLOCKS_PER_YEAR = 78_840_000
		const rewardTokenPrice = cacheManagerInstance.getTokenPrice(rewardDenom)

		// REWARD_PER_BLOCK = Number of tokens your farming contract gives out per block
		const REWARD_PER_BLOCK = calculateRewardsPerBlock(
			startTime,
			endTime,
			rewardAmount
		).decimalPlaces(0, 1)

		const totalRewardPricePerYear = new BigNumber(rewardTokenPrice ?? "0")
			.times(REWARD_PER_BLOCK)
			.times(BLOCKS_PER_YEAR)

		// Get Total LP Tokens Deposited in Farming Contract
		const LpToken = new Cw20QueryClient(client, lpTokenAddress)

		const lpUsd = convertMicroDenomToDenom(
			tokenOnePrice.multipliedBy(poolInfo.token1_reserve),
			token1.decimal
		).plus(
			convertMicroDenomToDenom(
				tokenTwoPrice.multipliedBy(poolInfo.token2_reserve),
				token2.decimal
			)
		)
		const lpTokenPrice = lpUsd.dividedBy(
			convertMicroDenomToDenom(poolInfo.lp_token_supply, 6)
		)

		const totalLPStakedInFarmingContract = await LpToken.balance({
			address: bondingPeriodAddress
		})

		// Calculate Total Price Of LP Tokens in Contract
		const totalPriceOfLpTokensInFarmingContract = new BigNumber(
			lpTokenPrice
		).times(totalLPStakedInFarmingContract.balance)

		// Calculate APR
		const apr = totalRewardPricePerYear
			.div(totalPriceOfLpTokensInFarmingContract)
			.times(100)

		return apr.isNaN() || !apr.isFinite() ? 0 : apr.toNumber()
	} catch (error) {
		console.error(error)
		return 0
	}
}
