import type { Metadata } from "next";
import { SearchResults } from "@/components/search/SearchResults";
import type { SearchResult } from "@/lib/data/search";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Suche - Mandaetli.ch",
};

type Props = {
	searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
	const { q = "", type: typeFilter } = await searchParams;

	let results: SearchResult[] = [];
	if (q.trim()) {
		results = await searchActorsServer(q);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Suche</h1>
				{q && (
					<p className="text-sm text-text-secondary">
						{results.length} Ergebnis{results.length !== 1 ? "se" : ""} für &ldquo;{q}&rdquo;
					</p>
				)}
			</div>

			<SearchResults query={q} results={results} typeFilter={typeFilter} />
		</div>
	);
}

async function searchActorsServer(query: string): Promise<SearchResult[]> {
	const supabase = await createClient();
	const { data, error } = await supabase.rpc("search_actors", {
		query,
		max_results: 50,
	});
	if (error || !data) return [];
	return data as SearchResult[];
}
