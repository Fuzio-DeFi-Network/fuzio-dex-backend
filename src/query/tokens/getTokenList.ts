/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Token } from "@type/model"
import { tokenListUrl } from "@utils/constants"
import { BigNumber } from "bignumber.js"

export const getTokenList = async () => {
	BigNumber.config({
		DECIMAL_PLACES: 18,
		EXPONENTIAL_AT: 18,
		ROUNDING_MODE: 1
	})

	try {
		const tokenListResponse = await fetch(tokenListUrl)
		const tokenListJson: any = await tokenListResponse.json()
		const tokenList: Token[] = tokenListJson.tokens.map((token: Token) => {
			return token
		})

		return tokenList
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("An error occurred:", error)
		throw error
	}
}
