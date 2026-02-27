import { createClient } from "@/lib/supabase/server";
import type { Actor, Connection } from "@/types/domain";

export type ConnectionWithActor = Connection & {
	otherActor: Actor;
};

/**
 * Fetch all active connections for an actor, enriched with the "other" actor data.
 * Handles bidirectional connections (actor can be source or target).
 */
export async function getConnectionsForActor(actorId: string): Promise<ConnectionWithActor[]> {
	const supabase = await createClient();

	// Fetch connections where actor is source or target
	const { data: connections, error } = await supabase
		.from("connections")
		.select("*")
		.or(`source_actor_id.eq.${actorId},target_actor_id.eq.${actorId}`)
		.is("valid_until", null);

	if (error || !connections) return [];

	// Collect IDs of the "other" actors
	const otherIds = new Set<string>();
	for (const conn of connections) {
		const otherId = conn.source_actor_id === actorId ? conn.target_actor_id : conn.source_actor_id;
		otherIds.add(otherId);
	}

	if (otherIds.size === 0) return [];

	// Fetch all other actors in one query
	const { data: actors, error: actorsError } = await supabase
		.from("actors")
		.select("*")
		.in("id", Array.from(otherIds));

	if (actorsError || !actors) return [];

	const actorMap = new Map(actors.map((a) => [a.id, a]));

	// Enrich connections with other actor data
	return connections
		.map((conn) => {
			const otherId =
				conn.source_actor_id === actorId ? conn.target_actor_id : conn.source_actor_id;
			const otherActor = actorMap.get(otherId);
			if (!otherActor) return null;
			return { ...conn, otherActor };
		})
		.filter((c): c is ConnectionWithActor => c !== null);
}
