import { BigNumber } from "bignumber.js"

export const calculateRewardsPerBlock = (
	startTime: number,
	endTime: number,
	totalAmount: string
) => {
	const duration = new BigNumber(endTime).minus(startTime)
	const blocks = duration.dividedBy(0.4)
	const amountPerBlock = new BigNumber(totalAmount).dividedBy(blocks)

	return amountPerBlock
}
