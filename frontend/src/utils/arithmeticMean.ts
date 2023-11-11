/**
 * Returns arithmetic mean of array.
 * @param array Array of numbers.
 * @return number Arithmetic mean of given array.
 */
const arithmeticMean = (array: Array<number>): number => {
	if (array.length === 0) {
		throw new Error("Array is empty. Cannot calculate mean.");
	}

	const sum = array.reduce((acc, num) => acc + num, 0);
	return sum / array.length;
};

export default arithmeticMean;
