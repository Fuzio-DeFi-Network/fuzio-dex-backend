import { BigNumber } from "bignumber.js"

export const calculateAPR = (
	totalTokenReward: BigNumber,
	tokenReserve: BigNumber,
	totalStakeBalance: BigNumber,
	totalLPBalance: BigNumber
): BigNumber => {
	const value1 = totalTokenReward.multipliedBy(100)
	const value2 = BigNumber(
		2 * tokenReserve.toNumber() * totalStakeBalance.toNumber()
	)
	const value3 = value2.dividedBy(totalLPBalance)
	return totalStakeBalance.gt(0)
		? value1.dividedBy(value3).decimalPlaces(2, 1)
		: BigNumber(0)
}
