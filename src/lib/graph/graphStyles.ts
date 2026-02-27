import type { ConfidenceLevel, ConnectionType } from "@/types";
import type { GraphActor, GraphParty } from "./types";

// ── Node colors ──────────────────────────────────────────────

const PERSON_COLOR = "#3b82f6";
const ORG_COLOR = "#22c55e";
const COMMISSION_COLOR = "#8b5cf6";
const DEFAULT_PARTY_COLOR = "#64748b";

/**
 * Returns the fill color for a node.
 * Persons are always blue; party color is stored separately as borderColor.
 */
export function getNodeColor(actor: GraphActor, _partyColorMap: Map<string, string>): string {
	if (actor.actor_type === "person") return PERSON_COLOR;
	if (actor.actor_type === "party") return actor.color ?? DEFAULT_PARTY_COLOR;
	if (actor.industry === "commission") return COMMISSION_COLOR;
	return ORG_COLOR;
}

/**
 * Returns the party ring color for a person node, or null for non-person actors.
 */
export function getNodeBorderColor(
	actor: GraphActor,
	partyColorMap: Map<string, string>,
): string | null {
	if (actor.actor_type === "person" && actor.party_id) {
		return partyColorMap.get(actor.party_id) ?? null;
	}
	return null;
}

// ── Node sizes ───────────────────────────────────────────────

const PARTY_NODE_SIZE = 28;

/** Returns a base size; final size is computed proportional to degree in buildGraph. */
export function getNodeSize(actor: GraphActor): number {
	if (actor.actor_type === "party") return PARTY_NODE_SIZE;
	return 6; // base size, will be adjusted by degree
}

// ── Edge styles ──────────────────────────────────────────────

const EDGE_COLORS: Record<ConnectionType, string> = {
	mandate: "#475569",
	membership: "#334155",
	lobbying: "#475569",
	donation: "rgba(245,158,11,0.2)",
	employment: "#334155",
};

const EDGE_SIZES: Record<ConnectionType, number> = {
	mandate: 1.5,
	membership: 1,
	lobbying: 1.5,
	donation: 1.5,
	employment: 1,
};

const EDGE_TYPES: Record<ConnectionType, string> = {
	mandate: "line",
	membership: "line",
	lobbying: "line",
	donation: "line",
	employment: "line",
};

export function getEdgeColor(connectionType: ConnectionType): string {
	return EDGE_COLORS[connectionType] ?? "#334155";
}

export function getEdgeSize(connectionType: ConnectionType): number {
	return EDGE_SIZES[connectionType] ?? 1;
}

export function getEdgeType(connectionType: ConnectionType): string {
	return EDGE_TYPES[connectionType] ?? "line";
}

// ── Edge opacity by confidence ───────────────────────────────

const CONFIDENCE_OPACITY: Record<ConfidenceLevel, number> = {
	verified: 1.0,
	declared: 0.8,
	media_reported: 0.5,
	inferred: 0.3,
};

export function getEdgeOpacity(confidence: ConfidenceLevel): number {
	return CONFIDENCE_OPACITY[confidence] ?? 0.5;
}

// ── Party color map builder ──────────────────────────────────

export function buildPartyColorMap(parties: GraphParty[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const party of parties) {
		if (party.color) {
			map.set(party.id, party.color);
		}
	}
	return map;
}
