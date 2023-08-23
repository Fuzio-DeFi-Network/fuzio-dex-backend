import { BaseError } from "./BaseError"

export class PoolListFetchError extends BaseError {
	public constructor(message?: string) {
		super(message ?? "Failed to fetch the pool list.")
		Object.setPrototypeOf(this, PoolListFetchError.prototype) // This is to ensure instanceof works correctly
	}
}
