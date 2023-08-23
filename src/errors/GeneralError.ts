import { BaseError } from "./BaseError"

export class GeneralError extends BaseError {
	public constructor(message?: string) {
		super(message ?? "An unexpected error occurred.")
	}
}
