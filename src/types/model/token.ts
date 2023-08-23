import { type Chain } from "./chain"
import { type NestedKeys } from "./generics"

export type Token = {
	bridgeHash?: string
	bridgeURI?: string
	chain?: Chain
	chainHash?: string
	chainURI?: string
	decimal: number
	denom: string
	fullName: string
	isIBCCoin: boolean
	isNativeCoin: boolean
	logoHash: string
	logoURI: string
	symbol: string
	tokenPrettyName: string
}

export type TokenKeys = NestedKeys<Token>
