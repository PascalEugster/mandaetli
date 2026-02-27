import { createClient } from "@/lib/supabase/server";
import type { Actor } from "@/types/domain";
import type { ConnectionWithActor } from "./connections";
import { getConnectionsForActor } from "./connections";
import type { VoteRecordWithVote } from "./votes";
import { getVoteRecordsForPerson } from "./votes";

export type ListPersonsOptions = {
	sortBy?: "name" | "canton" | "council";
	sortDir?: "asc" | "desc";
	party?: string;
	canton?: string;
	council?: "NR" | "SR";
};

/**
 * Fetch a single person by slug.
 */
export async function getPersonBySlug(slug: string): Promise<Actor | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("actors")
		.select("*")
		.eq("slug", slug)
		.eq("actor_type", "person")
		.single();

	if (error || !data) return null;
	return data;
}

/**
 * Fetch all active connections for a person, enriched with other actor data.
 */
export async function getPersonConnections(personId: string): Promise<ConnectionWithActor[]> {
	return getConnectionsForActor(personId);
}

/**
 * Fetch all vote records for a person with full vote details.
 */
export async function getPersonVoteRecords(personId: string): Promise<VoteRecordWithVote[]> {
	return getVoteRecordsForPerson(personId);
}

/**
 * Fetch commission memberships for a person.
 * Returns actors that the person is connected to via 'membership' connections
 * and whose name contains "Kommission" or "kommission".
 */
export async function getPersonCommissions(personId: string): Promise<Actor[]> {
	const supabase = await createClient();

	// Get membership connections where person is source
	const { data: connections, error } = await supabase
		.from("connections")
		.select("target_actor_id")
		.eq("source_actor_id", personId)
		.eq("connection_type", "membership")
		.is("valid_until", null);

	if (error || !connections || connections.length === 0) return [];

	const targetIds = connections.map((c) => c.target_actor_id);

	// Fetch target actors that are commissions
	const { data: actors, error: actorsError } = await supabase
		.from("actors")
		.select("*")
		.in("id", targetIds)
		.ilike("name", "%ommission%");

	if (actorsError || !actors) return [];
	return actors;
}

/**
 * List all persons with optional filters and sorting.
 */
export async function listPersons(options: ListPersonsOptions = {}): Promise<Actor[]> {
	const { sortBy = "name", sortDir = "asc", party, canton, council } = options;
	const supabase = await createClient();

	let query = supabase.from("actors").select("*").eq("actor_type", "person");

	if (party) {
		query = query.eq("party_id", party);
	}
	if (canton) {
		query = query.eq("canton", canton);
	}
	if (council) {
		query = query.eq("council", council);
	}

	query = query.order(sortBy, { ascending: sortDir === "asc" });

	const { data, error } = await query;

	if (error || !data) return [];
	return data;
}
