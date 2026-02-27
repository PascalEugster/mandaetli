import { parseAsArrayOf, parseAsString } from "nuqs";

export const graphSearchParams = {
	selected: parseAsString,
	parties: parseAsArrayOf(parseAsString, ","),
	cantons: parseAsArrayOf(parseAsString, ","),
	councils: parseAsArrayOf(parseAsString, ","),
	industries: parseAsArrayOf(parseAsString, ","),
	connectionTypes: parseAsArrayOf(parseAsString, ","),
	pathFrom: parseAsString,
	pathTo: parseAsString,
	q: parseAsString,
};
