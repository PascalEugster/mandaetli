import { createClient } from "@/lib/supabase/server";
import type { Actor } from "@/types/domain";

/**
 * Fetch a single party by slug.
 */
export async function getPartyBySlug(slug: string): Promise<Actor | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("actors")
		.select("*")
		.eq("slug", slug)
		.eq("actor_type", "party")
		.single();

	if (error || !data) return null;
	return data;
}

/**
 * Fetch all person actors that belong to a party.
 */
export async function getPartyMembers(partyId: string): Promise<Actor[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("actors")
		.select("*")
		.eq("actor_type", "person")
		.eq("party_id", partyId)
		.order("name", { ascending: true });

	if (error || !data) return [];
	return data;
}

/**
 * Get connection statistics grouped by industry for all members of a party.
 * Returns a record of industry name to connection count.
 */
export async function getPartyConnectionStats(partyId: string): Promise<Record<string, number>> {
	const supabase = await createClient();

	// Get all member IDs
	const { data: members, error: membersError } = await supabase
		.from("actors")
		.select("id")
		.eq("actor_type", "person")
		.eq("party_id", partyId);

	if (membersError || !members || members.length === 0) return {};

	const memberIds = members.map((m) => m.id);

	// Get all connections where members are source
	const { data: connections, error: connError } = await supabase
		.from("connections")
		.select("target_actor_id")
		.in("source_actor_id", memberIds)
		.is("valid_until", null);

	if (connError || !connections || connections.length === 0) return {};

	const targetIds = [...new Set(connections.map((c) => c.target_actor_id))];

	// Get target actors with their industries
	const { data: targets, error: targetsError } = await supabase
		.from("actors")
		.select("id, industry")
		.in("id", targetIds)
		.not("industry", "is", null);

	if (targetsError || !targets) return {};

	// Build industry-to-id map for counting
	const industryById = new Map(targets.map((t) => [t.id, t.industry as string]));

	// Count connections per industry
	const stats: Record<string, number> = {};
	for (const conn of connections) {
		const industry = industryById.get(conn.target_actor_id);
		if (industry) {
			stats[industry] = (stats[industry] ?? 0) + 1;
		}
	}

	return stats;
}

/**
 * List all parties, sorted by NR seats descending.
 */
export async function listParties(): Promise<Actor[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("actors")
		.select("*")
		.eq("actor_type", "party")
		.order("seats_nr", { ascending: false });

	if (error || !data) return [];
	return data;
}
