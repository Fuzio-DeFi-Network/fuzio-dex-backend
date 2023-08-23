import { type PoolWithData } from "@type/model"
import { BigNumber } from "bignumber.js"

export const calculateHeighestMetrics = async (
	poolsWithData: PoolWithData[]
): Promise<{
	highestApr: { highestApr: BigNumber; highestAprPool: PoolWithData }
	highestLiquidity: {
		highestLiquidity: BigNumber
		highestLiquidityPool: PoolWithData
	}
}> => {
	let highestAprPool = poolsWithData[0]
	let highestApr = BigNumber(0)
	let highestLiquidityPool = poolsWithData[0]
	let highestLiquidity = BigNumber(0)

	for (const pool of poolsWithData) {
		if (BigNumber(pool.liquidity.usd).gt(highestLiquidity)) {
			highestLiquidityPool = pool
			highestLiquidity = BigNumber(pool.liquidity.usd)
		}

		if (pool.highestApr && highestApr.lt(pool.highestApr.highestAprValue)) {
			highestApr = BigNumber(pool.highestApr.highestAprValue)
			highestAprPool = pool
		}
	}

	return {
		highestApr: { highestApr, highestAprPool },
		highestLiquidity: { highestLiquidity, highestLiquidityPool }
	}
}
