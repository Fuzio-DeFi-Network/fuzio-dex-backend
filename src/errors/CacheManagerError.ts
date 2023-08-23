import { BaseError } from "./BaseError"

export class CacheManagerError extends BaseError {
	public constructor(message: string) {
		super(message)
		this.name = "CacheManagerError"
		Object.setPrototypeOf(this, CacheManagerError.prototype) // This is to ensure instanceof works correctly
	}
}
