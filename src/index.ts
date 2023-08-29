import { staticPlugin } from "@elysiajs/static"
import { swagger } from "@elysiajs/swagger"
import { refreshTokenAndPools } from "@query/cache"
import { refreshData } from "@query/cache/refreshData"
import { generateOGImage } from "@query/og/generateOGImage"
import {
	type PoolKeys,
	type PoolWithDataKeys,
	type TokenKeys
} from "@type/model"
import { cacheManagerInstance } from "@utils/cache"
import { launchStyle } from "@utils/cli/styles"
import { cron } from "@utils/helpers"
import { Elysia } from "elysia"

await refreshTokenAndPools()

const app = new Elysia()
	.get(
		"/",
		() => `
                                  _____________
                           __,---'::.-  -::_ _ '-----.___      ______
                       _,-'::_  ::-  -  -. _   ::-::_   .'--,'   :: .:'-._
                    -'_ ::   _  ::_ .:   :: - _ .:   ::- _/ ::   ,-. ::. '-._
                _,-'   ::-  ::        ::-  _ ::  -  ::     |  .: ((|))      ::'
        ___,---'   ::    ::    ;::   ::     :.- _ ::._  :: | :    '_____::..--'
    ,-""  ::  ::.   ,------.  (.  ::  |  ::  ::  ,-- :. _  :'. ::  |       '-._
   '     ::   '   _._.:_  :.)___,-------------._ :: ____'-._ '._ ::'--...___; ;
 ;:::. ,--'--"""""      /  /                     |. |     ''-----''''---------'
;  '::;              _ /.:/_,                    _|.:|_,
|    ;             ='-//||--"                  ='-//||--"
'   .|               ''  ''                     ''  ''
 |::'|
  |   |    🦎🦎🦎 Welcome to the Fuzio Dex API! Head to /swagger for a better UI! 🦎🦎🦎
   '..:'.
     '.  '--.____
       '-:______ '-._
                '---'
`
	)
	.get("/poolList", () => cacheManagerInstance.getPoolList())
	.get("/poolDataList", async () => cacheManagerInstance.getPoolListWithData())
	.get("/tokenList", async () => cacheManagerInstance.getTokenList())
	.get("/highestApr", async () => cacheManagerInstance.getHighestAPRPool())
	.get("/highestLiq", async () =>
		cacheManagerInstance.getHighestLiquidityPool()
	)
	.get("/newestPool", async () => cacheManagerInstance.getNewestPool())
	.get("/price/:denom", async ({ params: { denom } }) => {
		const decodedDenom = decodeURIComponent(denom)
		return cacheManagerInstance.getTokenPrice(decodedDenom)
	})
	.get("/poolData/:property/:value", async ({ params: { property, value } }) =>
		cacheManagerInstance.getPoolWithDataByProperty(
			property as PoolWithDataKeys,
			value
		)
	)
	.get("/pool/:property/:value", async ({ params: { property, value } }) =>
		cacheManagerInstance.getPoolByProperty(property as PoolKeys, value)
	)
	.get("/token/:property/:value", async ({ params: { property, value } }) => {
		return cacheManagerInstance.getTokenByProperty(property as TokenKeys, value)
	})
	.get(
		"/og/:type/:value",
		async ({ params: { type, value } }) =>
			await generateOGImage(type as "default" | "pool" | "swap", value)
	)
	.use(
		swagger({
			documentation: {
				info: {
					contact: {
						name: "Telegram",
						url: "https://fuzio.network/social/telegram"
					},
					description: "API Routes for the Fuzio DEX",
					title: "Fuzio DEX Backend",
					version: "1.0.0"
				}
			}
		})
	)
	.use(staticPlugin({}))
	.use(
		cron({
			name: "Refresh Token & Pool List",
			pattern: "0 */5 * * * *",
			protect: true,
			async run() {
				console.log("Starting cron job: Refresh Token & Pool List")
				await refreshTokenAndPools()
				console.log("Finished cron job: Refresh Token & Pool List")
			}
		})
	)
	.use(
		cron({
			name: "Refresh Cached Data",
			pattern: "0 * * * * *",
			protect: true,
			async run() {
				console.log("Starting cron job: Refresh Cached Data")
				await refreshData()
				console.log("Finished cron job: Refresh Cached Data")
			}
		})
	)
	.onError(({ code, set }) => {
		console.error(`Error Code: ${code}`)

		if (code === "NOT_FOUND") {
			set.status = 404
			return "Route Not Found :("
		}

		if (code === "VALIDATION") {
			console.error("Validation error occurred.")
			return "Validation Error :("
		}

		if (code === "INTERNAL_SERVER_ERROR") {
			console.error("Internal server error occurred.")
			return "Internal Server Error :("
		}

		if (code === "PARSE") {
			console.error("Parsing error occurred.")
			return "Parsing Error :("
		}

		if (code === "UNKNOWN") {
			console.error("Unknown error occurred.")
			return "Unknown Error :("
		} else {
			console.error("Unknown error occurred.")
			return "Unknown Error :("
		}
	})
	.listen({ port: process.env.BUNPORT ?? 3_000 })

console.log(
	launchStyle.Render(
		`🦎 Fuzio DEX Microservice started at ${app.server?.hostname}:${app.server?.port}`
	)
)
