import Graph from "graphology";
import type { ConfidenceLevel, ConnectionType } from "@/types";
import {
	buildPartyColorMap,
	getEdgeColor,
	getEdgeOpacity,
	getEdgeSize,
	getEdgeType,
	getNodeBorderColor,
	getNodeColor,
} from "./graphStyles";
import type { GraphActor, GraphConnection, GraphParty } from "./types";

const PARTY_NODE_SIZE = 28;
const MIN_NODE_SIZE = 6;
const MAX_NODE_SIZE = 24;

export function buildGraph(
	actors: GraphActor[],
	connections: GraphConnection[],
	parties: GraphParty[],
): Graph {
	const graph = new Graph({ multi: true, type: "undirected" });
	const partyColorMap = buildPartyColorMap(parties);
	const actorIds = new Set(actors.map((a) => a.id));

	// Add nodes with base attributes
	for (const actor of actors) {
		const borderColor = getNodeBorderColor(actor, partyColorMap);

		graph.addNode(actor.id, {
			label:
				actor.actor_type === "person" && actor.first_name
					? `${actor.first_name} ${actor.last_name}`
					: actor.name,
			x: Math.random() * 1000,
			y: Math.random() * 1000,
			size: 6, // temporary, will be updated after edges are added
			color: getNodeColor(actor, partyColorMap),
			borderColor: borderColor ?? undefined,
			borderSize: borderColor ? 2 : 0,
			actorType: actor.actor_type,
			partyId: actor.party_id,
			canton: actor.canton,
			council: actor.council,
			industry: actor.industry,
			slug: actor.slug,
			abbreviation: actor.abbreviation,
		});
	}

	// Add edges
	for (const conn of connections) {
		if (!actorIds.has(conn.source_actor_id) || !actorIds.has(conn.target_actor_id)) {
			continue;
		}

		const opacity = getEdgeOpacity(conn.confidence as ConfidenceLevel);
		const baseColor = getEdgeColor(conn.connection_type as ConnectionType);

		graph.addEdge(conn.source_actor_id, conn.target_actor_id, {
			connectionType: conn.connection_type,
			confidence: conn.confidence,
			role: conn.role,
			label: conn.role,
			color: baseColor,
			size: getEdgeSize(conn.connection_type as ConnectionType),
			type: getEdgeType(conn.connection_type as ConnectionType),
			opacity,
		});
	}

	// Compute degree-proportional node sizes
	let maxDegree = 1;
	for (const node of graph.nodes()) {
		const degree = graph.degree(node);
		if (degree > maxDegree) maxDegree = degree;
	}

	for (const node of graph.nodes()) {
		const actorType = graph.getNodeAttribute(node, "actorType");
		if (actorType === "party") {
			graph.setNodeAttribute(node, "size", PARTY_NODE_SIZE);
		} else {
			const degree = graph.degree(node);
			const size = MIN_NODE_SIZE + (degree / maxDegree) * (MAX_NODE_SIZE - MIN_NODE_SIZE);
			graph.setNodeAttribute(node, "size", size);
		}
	}

	return graph;
}
