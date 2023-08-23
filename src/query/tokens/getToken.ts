import { GeneralError } from "@errors/GeneralError"
import { TokenNotFoundError } from "@errors/TokenNotFoundError"
import { type Token } from "@type/model"
import { cacheManagerInstance } from "@utils/cache"

export const getToken = async (denom: string): Promise<Token> => {
	try {
		// Ensure data is fetched and cached
		if (!cacheManagerInstance.getTokenList().length) {
			await cacheManagerInstance.updateCachedData()
		}

		const token: Token | undefined = cacheManagerInstance
			.getTokenList()
			.find((currentToken: Token) => {
				return (
					currentToken.denom === denom ||
					currentToken.chain?.localDenom === denom
				)
			})

		if (!token) {
			throw new TokenNotFoundError(denom)
		}

		return token
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("An unexpected error occurred:", error)
		throw new GeneralError()
	}
}
