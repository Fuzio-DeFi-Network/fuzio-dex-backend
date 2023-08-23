export type Chain = {
	chainId: string
	chainName: string
	chainPrettyName: string
	gasPrice?: {
		amount: string
		denom: string
	}
	grpc?: string[]
	ibcChannels?: {
		deposit_channel: string
		port_id: string
		withdraw_channel: string
	}
	isEVM: boolean
	localDenom: string
	rest?: string[]
	rpc?: string[]
}
