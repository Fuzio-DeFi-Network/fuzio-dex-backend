export const fetchWithRetry = async (
	url: string,
	retries: number = 3,
	delay: number = 1_000
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
	for (let index = 0; index < retries; index++) {
		try {
			const response = await fetch(url)
			if (!response.ok) throw new Error("Network response was not ok")
			return await response.json()
		} catch (error_) {
			const error = error_ as Error
			if (index < retries - 1) {
				await new Promise((resolve) => {
					setTimeout(resolve, delay)
				})
			} else {
				throw new Error(
					`Failed to fetch ${url} after ${retries} attempts due to: ${error.message}`
				)
			}
		}
	}

	throw new Error(`Failed to fetch ${url} after ${retries} attempts.`)
}
