// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNestedValue = <T>(object: T, path: string): any => {
	const keys = path.split(".")
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let current: any = object

	for (const key of keys) {
		if (current[key] === undefined) {
			return undefined
		}

		current = current[key]
	}

	return current
}
