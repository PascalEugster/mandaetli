import type { ActorType, ConfidenceLevel, ConnectionType, CouncilType } from "@/types";

/** Lightweight actor projection for graph rendering */
export type GraphActor = {
	id: string;
	slug: string;
	name: string;
	actor_type: ActorType;
	canton: string | null;
	council: CouncilType | null;
	party_id: string | null;
	abbreviation: string | null;
	color: string | null;
	industry: string | null;
	first_name: string | null;
	last_name: string | null;
	seats_nr: number | null;
	seats_sr: number | null;
};

/** Lightweight connection projection for graph rendering */
export type GraphConnection = {
	id: string;
	source_actor_id: string;
	target_actor_id: string;
	connection_type: ConnectionType;
	confidence: ConfidenceLevel;
	role: string | null;
};

/** Minimal party projection for color lookup */
export type GraphParty = {
	id: string;
	color: string | null;
};
