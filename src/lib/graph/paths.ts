import type Graph from "graphology";
import { bidirectional } from "graphology-shortest-path/unweighted";

/**
 * Find the shortest path between two nodes.
 * Returns array of node IDs forming the path, or null if unreachable.
 */
export function findShortestPath(
	graph: Graph,
	sourceId: string,
	targetId: string,
): string[] | null {
	if (!graph.hasNode(sourceId) || !graph.hasNode(targetId)) {
		return null;
	}
	return bidirectional(graph, sourceId, targetId);
}

/**
 * Given a path (array of node IDs), compute the set of node IDs and edge IDs on that path.
 */
export function getPathNodeAndEdgeIds(
	graph: Graph,
	path: string[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
	const nodeIds = new Set(path);
	const edgeIds = new Set<string>();

	for (let i = 0; i < path.length - 1; i++) {
		const edges = graph.edges(path[i], path[i + 1]);
		for (const edge of edges) {
			edgeIds.add(edge);
		}
	}

	return { nodeIds, edgeIds };
}
