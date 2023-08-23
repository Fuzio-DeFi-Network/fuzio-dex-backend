import { BaseError } from "./BaseError"

export class UnexpectedPoolStructureError extends BaseError {
	public constructor() {
		super(`Unexpected pool structure!`)
		Object.setPrototypeOf(this, UnexpectedPoolStructureError.prototype) // This is to ensure instanceof works correctly
	}
}
