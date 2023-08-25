import { type PoolWithData } from "@type/model"
import { BigNumber } from "bignumber.js"

export const calculateHighestMetrics = async (
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

		if (pool.highestAPR && highestApr.lt(pool.highestAPR.highestAprValue)) {
			highestApr = BigNumber(pool.highestAPR.highestAprValue)
			highestAprPool = pool
		}
	}

	return {
		highestApr: { highestApr, highestAprPool },
		highestLiquidity: { highestLiquidity, highestLiquidityPool }
	}
}
