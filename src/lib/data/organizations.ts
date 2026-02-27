import { createClient } from "@/lib/supabase/server";
import type { Actor } from "@/types/domain";
import type { ConnectionWithActor } from "./connections";
import { getConnectionsForActor } from "./connections";

export type ListOrganizationsOptions = {
	sortBy?: "name" | "industry";
	sortDir?: "asc" | "desc";
	industry?: string;
};

/**
 * Fetch a single organization by slug.
 */
export async function getOrgBySlug(slug: string): Promise<Actor | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("actors")
		.select("*")
		.eq("slug", slug)
		.eq("actor_type", "organization")
		.single();

	if (error || !data) return null;
	return data;
}

/**
 * Fetch all active connections for an organization.
 */
export async function getOrgConnections(orgId: string): Promise<ConnectionWithActor[]> {
	return getConnectionsForActor(orgId);
}

/**
 * List all organizations with optional filters and sorting.
 */
export async function listOrganizations(options: ListOrganizationsOptions = {}): Promise<Actor[]> {
	const { sortBy = "name", sortDir = "asc", industry } = options;
	const supabase = await createClient();

	let query = supabase.from("actors").select("*").eq("actor_type", "organization");

	if (industry) {
		query = query.eq("industry", industry);
	}

	query = query.order(sortBy, { ascending: sortDir === "asc" });

	const { data, error } = await query;

	if (error || !data) return [];
	return data;
}
