import { calculateAPR } from "./calculateAPR"
import { updateBondingPeriod } from "./updateBondingPeriod"
import { type CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { contracts } from "@fuzio/contracts"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type BondingPeriod, type Pool } from "@type/model"
import { BigNumber } from "bignumber.js"

const {
	FuzioStaking: { FuzioStakingQueryClient },
	Cw20: { Cw20QueryClient }
} = contracts

export const calculateBondingPeriods = async (
	client: CosmWasmClient,
	pool: Pool,
	poolInfo: InfoResponse
): Promise<BondingPeriod[] | undefined> => {
	const bondingPeriods: BondingPeriod[] = []
	const lpQueryClient = new Cw20QueryClient(client, poolInfo.lp_token_address)

	if (!pool.bondingPeriods) {
		return undefined
	}

	for await (const bondingPeriod of pool.bondingPeriods) {
		const stakingQueryClient = new FuzioStakingQueryClient(
			client,
			bondingPeriod.address
		)
		const config = await stakingQueryClient.config()
		const totalStakedBalance = await lpQueryClient.balance({
			address: bondingPeriod.address
		})

		let bondingPeriodToReturn: BondingPeriod = {
			address: bondingPeriod.address,
			distributionEnd: 0,
			distributionStart: 0,
			lockDuration: config.lock_duration,
			rewards: []
		}

		for (const [
			localIndex,
			schedule
		] of config.distribution_schedule.entries()) {
			const totalTokenReward = BigNumber(schedule.amount)
			const tokenReserve = BigNumber(poolInfo.token1_reserve)
			const totalLPBalance = BigNumber(poolInfo.lp_token_supply)
			const totalStakeBalance = BigNumber(totalStakedBalance.balance)

			const apr = calculateAPR(
				totalTokenReward,
				tokenReserve,
				totalStakeBalance,
				totalLPBalance
			)

			bondingPeriodToReturn.rewards?.push({
				apr: apr.toNumber(),
				rewardToken: config.reward_token[localIndex]
			})

			bondingPeriodToReturn = updateBondingPeriod(
				bondingPeriodToReturn,
				schedule
			)
		}

		bondingPeriods.push(bondingPeriodToReturn)
	}

	return bondingPeriods
}
