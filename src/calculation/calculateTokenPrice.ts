import { BigNumber } from "bignumber.js"

export const calculateTokenPrice = (
	tokenReserve: BigNumber,
	oppositeTokenReserve: BigNumber,
	basePrice: BigNumber,
	isBaseToken: boolean
): BigNumber => {
	return isBaseToken
		? basePrice
		: BigNumber(tokenReserve).dividedBy(oppositeTokenReserve).times(basePrice)
}
