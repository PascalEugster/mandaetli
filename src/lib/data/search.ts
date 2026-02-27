import { createClient } from "@/lib/supabase/client";
import type { ActorType, CouncilType } from "@/types/domain";

export type SearchResult = {
	id: string;
	slug: string;
	name: string;
	first_name: string | null;
	last_name: string | null;
	actor_type: ActorType;
	canton: string | null;
	council: CouncilType | null;
	party_id: string | null;
	abbreviation: string | null;
	color: string | null;
	portrait_url: string | null;
	industry: string | null;
	similarity: number;
};

/**
 * Search actors via the database RPC function.
 * Uses the browser-side Supabase client since search is interactive.
 */
export async function searchActors(query: string, maxResults = 20): Promise<SearchResult[]> {
	if (!query.trim()) return [];

	const supabase = createClient();

	const { data, error } = await supabase.rpc("search_actors", {
		query,
		max_results: maxResults,
	});

	if (error || !data) return [];

	return data as SearchResult[];
}
