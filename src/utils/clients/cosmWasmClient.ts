import { endPoint } from ".."
import { connectWithBatchClient } from "./httpBatchClient"
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { type TendermintClient } from "@cosmjs/tendermint-rpc"

export const tmClient: TendermintClient = await connectWithBatchClient(endPoint)
export const client = await CosmWasmClient.create(tmClient)
