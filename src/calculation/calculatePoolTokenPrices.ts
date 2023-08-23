import { calculateTokenPrice } from "./calculateTokenPrice"
import { type InfoResponse } from "@fuzio/contracts/types/FuzioPool.types"
import { type Token } from "@type/model"
import { baseToken } from "@utils/constants"
import { convertDenomToMicroDenom } from "@utils/math"
import { BigNumber } from "bignumber.js"

export const calculatePoolTokenPrices = (
	poolInfo: InfoResponse,
	baseTokenPrice: BigNumber,
	token1: Token,
	token2: Token
): { tokenOnePrice: BigNumber; tokenTwoPrice: BigNumber } => {
	const decimalDiff = token2.decimal - token1.decimal

	const tokenOnePrice = calculateTokenPrice(
		BigNumber(poolInfo.token1_reserve),
		BigNumber(poolInfo.token2_reserve),
		baseTokenPrice,
		token1.denom === baseToken
	)

	const tokenTwoPrice = calculateTokenPrice(
		BigNumber(poolInfo.token1_reserve),
		BigNumber(poolInfo.token2_reserve),
		tokenOnePrice,
		token2.denom === baseToken
	).times(convertDenomToMicroDenom(1, decimalDiff))

	return { tokenOnePrice, tokenTwoPrice }
}
