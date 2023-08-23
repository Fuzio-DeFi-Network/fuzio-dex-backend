/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cron, type CronOptions } from "croner"
import { type Elysia } from "elysia"

export type CronConfig<Name extends string = string> = CronOptions & {
	/**
	 * Cronjob name to registered to `store`
	 */
	name: Name
	/**
	 * Input pattern, input date, or input ISO 8601 time string
	 *
	 * ---
	 * ```plain
	 * ┌────────────── second (optional)
	 * │ ┌──────────── minute
	 * │ │ ┌────────── hour
	 * │ │ │ ┌──────── day of month
	 * │ │ │ │ ┌────── month
	 * │ │ │ │ │ ┌──── day of week
	 * │ │ │ │ │ │
	 *
	 * ```
	 */
	pattern: string
	/**
	 * Function to execute on time
	 */
	run: (store: Cron) => Promise<any> | any
}

export const cron =
	<Name extends string = string>({
		pattern,
		name,
		run,
		...options
	}: CronConfig<Name>) =>
	(app: Elysia) => {
		if (!pattern) throw new Error("pattern is required")
		if (!name) throw new Error("name is required")

		return app.state("cron", {
			// @ts-expect-error any
			...app.store?.cron,
			[name]: new Cron(pattern, options, () => run(app.store as any))
		} as Record<Name, Cron>)
	}
