export const poolListUrl = `https://raw.githubusercontent.com/Fuzio-DeFi-Network/fuzio-assetlist/feat/morePoolDetails/${
	process.env.SEI_NETWORK === "MAINNET" ? "mainnet/" : "testnet/"
}poolList.json`

export const tokenListUrl = `https://raw.githubusercontent.com/Fuzio-DeFi-Network/fuzio-assetlist/main/${
	process.env.SEI_NETWORK === "MAINNET" ? "mainnet/" : "testnet/"
}tokenList.json`

export const stablePoolId = process.env.SEI_NETWORK === "MAINNET" ? 0 : 1

export const baseToken =
	process.env.SEI_NETWORK === "MAINNET"
		? "usei"
		: "factory/sei1nsfrq4m5rnwtq5f0awkzr6u9wpsycctjlgzr9q/ZIO"

export const endPoint =
	process.env.SEI_NETWORK === "MAINNET"
		? "https://rpc.fuzio.network"
		: "https://rpc-testnet.sei-apis.com"
