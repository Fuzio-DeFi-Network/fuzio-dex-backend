/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type Schedule } from "@fuzio/contracts/types/FuzioStaking.types"
import { type BondingPeriod } from "@type/model"

export const updateBondingPeriod = (
	bondingPeriod: BondingPeriod,
	schedule: Schedule
): BondingPeriod => {
	if (
		schedule.start_time < bondingPeriod?.distributionStart! ||
		bondingPeriod.distributionStart === 0
	) {
		bondingPeriod.distributionStart = schedule.start_time
	}

	if (schedule.end_time > bondingPeriod?.distributionEnd!) {
		bondingPeriod.distributionEnd = schedule.end_time
	}

	return bondingPeriod
}
