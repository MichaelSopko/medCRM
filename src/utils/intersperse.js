
/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * @url http://stackoverflow.com/a/23619085
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */
export default function intersperse(arr, sep) {
	if (arr.length === 0) {
		return [];
	}

	return arr.slice(1).reduce(function (xs, x, i) {
		return xs.concat([sep, x]);
	}, [arr[0]]);
}