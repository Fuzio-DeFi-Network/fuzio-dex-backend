import { BaseError } from "./BaseError"

export class TokenNotFoundError extends BaseError {
	public constructor(denom: string) {
		super(`No token found for denom: ${denom}`)
		Object.setPrototypeOf(this, TokenNotFoundError.prototype) // This is to ensure instanceof works correctly
	}
}
