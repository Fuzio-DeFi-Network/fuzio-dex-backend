import { type NestedKeys } from "./generics"
import { type Denom } from "@fuzio/contracts/types/FuzioPool.types"

export type Reward = {
	apr: number
	rewardToken: Denom
}

export type BondingPeriod = {
	address: string
	distributionEnd?: number
	distributionStart?: number
	lockDuration?: number
	rewards?: Reward[]
}

export type LiquidityToken = {
	amount?: string
	denom: string
	tokenPrice?: string
}

export type Liquidity = {
	token1: LiquidityToken
	token2: LiquidityToken
	usd?: string
}

export type Pool = {
	bondingPeriods?: BondingPeriod[]
	isVerified: boolean
	liquidity: Liquidity
	swapAddress: string
}

export type PoolWithData = Pool & {
	bondingPeriods?: BondingPeriod[]
	highestApr?: { highestAprToken: Denom | undefined; highestAprValue: number }
	isVerified: boolean
	liquidity: Liquidity & { usd: string }
	lpTokenAddress: string
	lpTokens: string
	poolId: number
	ratio: string
	swapAddress: string
}

export type PoolKeys = NestedKeys<Pool>
export type PoolWithDataKeys = NestedKeys<PoolWithData>
