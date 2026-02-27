import { connections as allConnections } from "@/lib/mock/data";
import type { ConfidenceLevel, Connection, ConnectionType } from "@/types";

export interface ConnectionFilters {
	connection_type?: ConnectionType;
	confidence?: ConfidenceLevel;
	data_source_id?: string;
}

export async function getConnections(filters?: ConnectionFilters): Promise<Connection[]> {
	let conns = allConnections;

	if (!filters) return conns;

	if (filters.connection_type) {
		conns = conns.filter((c) => c.connection_type === filters.connection_type);
	}

	if (filters.confidence) {
		conns = conns.filter((c) => c.confidence === filters.confidence);
	}

	if (filters.data_source_id) {
		conns = conns.filter((c) => c.data_source_id === filters.data_source_id);
	}

	return conns;
}

export async function getConnectionsByActor(actorId: string): Promise<Connection[]> {
	return allConnections.filter(
		(c) => c.source_actor_id === actorId || c.target_actor_id === actorId,
	);
}

export async function getConnectionBetween(
	sourceId: string,
	targetId: string,
): Promise<Connection[]> {
	return allConnections.filter(
		(c) =>
			(c.source_actor_id === sourceId && c.target_actor_id === targetId) ||
			(c.source_actor_id === targetId && c.target_actor_id === sourceId),
	);
}
