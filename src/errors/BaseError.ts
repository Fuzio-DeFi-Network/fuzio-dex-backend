export class BaseError extends Error {
	public constructor(message: string) {
		super(message)
		this.name = this.constructor.name
		Object.setPrototypeOf(this, BaseError.prototype) // This is to ensure instanceof works correctly
		Error.captureStackTrace(this, this.constructor)
	}
}
