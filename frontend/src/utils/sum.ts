/**
 * Returns sum of array.
 * @param array Array of numbers.
 * @return number Sum of elements of given array.
 */
const sum = (array: Array<number>): number => {
	return array.reduce((acc, num) => acc + num, 0);
};

export default sum;
