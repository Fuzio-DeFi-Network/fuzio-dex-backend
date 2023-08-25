import { calculateAPR } from "./calculateAPR"
import { updateBondingPeriod } from "./updateBondingPeriod"
import { type CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { contracts } from "@fuzio/contracts"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type BondingPeriod, type Pool, type Token } from "@type/model"
import { type BigNumber } from "bignumber.js"

const {
	FuzioStaking: { FuzioStakingQueryClient }
} = contracts

export const calculateBondingPeriods = async (
	client: CosmWasmClient,
	pool: Pool,
	poolInfo: InfoResponse,
	tokenOnePrice: BigNumber,
	tokenTwoPrice: BigNumber,
	token1: Token,
	token2: Token
): Promise<BondingPeriod[] | undefined> => {
	const bondingPeriods: BondingPeriod[] = []

	if (!pool.bondingPeriods) {
		return undefined
	}

	for await (const bondingPeriod of pool.bondingPeriods) {
		const stakingQueryClient = new FuzioStakingQueryClient(
			client,
			bondingPeriod.address
		)
		const config = await stakingQueryClient.config()

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
			const apr = await calculateAPR(
				Object.values(config.reward_token[localIndex])[0],
				schedule.start_time,
				schedule.end_time,
				schedule.amount,
				bondingPeriod.address,
				config.lp_token_contract,
				poolInfo,
				tokenOnePrice,
				tokenTwoPrice,
				token1,
				token2
			)

			bondingPeriodToReturn.rewards?.push({
				apr,
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
