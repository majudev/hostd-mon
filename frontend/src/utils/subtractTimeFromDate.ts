export interface SubtractTimeOptions {
	hours?: number;
	days?: number;
	years?: number;
}

const subtractTimeFromDate = (inputDate: Date, options: SubtractTimeOptions): Date => {
	const { hours = 0, days = 0, years = 0 } = options;
	const resultDate = new Date(inputDate);

	// Subtract hours
	resultDate.setHours(resultDate.getHours() - hours);

	// Subtract days
	resultDate.setDate(resultDate.getDate() - days);

	// Subtract years
	resultDate.setFullYear(resultDate.getFullYear() - years);

	return resultDate;
}

export default subtractTimeFromDate;
