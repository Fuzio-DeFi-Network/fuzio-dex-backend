import {
	HttpBatchClient,
	type HttpBatchClientOptions,
	type HttpEndpoint,
	type RpcClient,
	Tendermint34Client,
	type TendermintClient
} from "@cosmjs/tendermint-rpc"

export const connectWithBatchClient = async (
	endpoint: HttpEndpoint | string,
	options?: Partial<HttpBatchClientOptions>
): Promise<TendermintClient> => {
	const rpcClient: RpcClient = new HttpBatchClient(endpoint, options)
	// eslint-disable-next-line canonical/id-match
	const tmClient = (await Tendermint34Client.create(
		rpcClient
	)) as TendermintClient
	return tmClient
}
