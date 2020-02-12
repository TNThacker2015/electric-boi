const f = BigInt;
const under20 = [
	"",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
	"thirteen",
	"fourteen",
	"fifteen",
	"sixteen",
	"seventeen",
	"eighteen",
	"nineteen",
	"twenty"
];
const multiples10 = [
	"",
	"ten",
	"twenty",
	"thirty",
	"forty",
	"fifty",
	"sixty",
	"seventy",
	"eighty",
	"ninety"
];
const low = ["hundred", "thousand"];
const higher = [
	"m",
	"b",
	"tr",
	"quadr",
	"quint",
	"sext",
	"sept",
	"oct",
	"non",
	"dec",
	"undec",
	"duodec",
	"tredec",
	"quattuordec",
	"quinquadec",
	"sedec",
	"septendec",
	"octodec",
	"novendec"
];
const highestPrefixes = [
	"",
	"un",
	"duo",
	"tres",
	"quattuor",
	"quinqua",
	"ses",
	"septem",
	"octo",
	"novem"
];
const vigints = [
	"vigint",
	"trigint",
	"quadragint",
	"quinquagint",
	"sexagint",
	"septuagint",
	"octogint",
	"nonagint"
];
export const toWords = (num: bigint) => {
	// if (num <= 20) return under20[Number(num)];
	const ones = Number(num % f(10));
	const tens = Number((num - f(ones)) / f(10)) % 10;
	const hundreds = Number((num - f(tens)) / f(100));
	if (num < 1000)
		return num.toString();
	if (num < 1000000) return `${(Number(num) / 1000).toFixed(3)} thousand`;
	for (const [index, high] of higher.entries()) {
		const m = f(10) ** ((f(index) + f(2)) * f(3));
		if (num < m * f(1000)) return `${num / m} ${high}illion`;
	}
	for (const [index, h] of vigints.entries()) {
		for (const [i, p] of highestPrefixes.entries()) {
			const m = f(10) ** ((f((index * 10) + i) + f(21)) * f(3));
			if (num < m * f(1000)) return `${num / m} ${p}${h}illion`;
		}
	}
	return Number(num).toExponential();
};
