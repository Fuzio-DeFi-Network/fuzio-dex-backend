import { type HighestAPR, type Reward } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"
import { BigNumber } from "bignumber.js"

export const getHighestApr = (
	rewards: Reward[],
	highestAPR: HighestAPR | undefined
): HighestAPR | undefined => {
	const temporaryHighestApr: HighestAPR | undefined = highestAPR

	if (rewards.length === 0) {
		return undefined
	}

	for (const reward of rewards) {
		const rewardToken = cacheManagerInstance.getTokenByProperty(
			"denom",
			Object.values(reward.rewardToken)[0]
		)

		const rewardApr = BigNumber(reward.apr)

		if (
			temporaryHighestApr &&
			rewardApr.gt(temporaryHighestApr.highestAprValue)
		) {
			temporaryHighestApr.highestAprValue = rewardApr.toNumber()
			temporaryHighestApr.highestAprToken = rewardToken
		}
	}

	return temporaryHighestApr
}
