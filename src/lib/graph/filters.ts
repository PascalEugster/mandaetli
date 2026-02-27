import type Graph from "graphology";

export type FilterState = {
	parties: string[] | null;
	cantons: string[] | null;
	councils: string[] | null;
	industries: string[] | null;
	connectionTypes: string[] | null;
};

export type ViewLevel = "overview" | "filtered" | "focused";

export function deriveViewLevel(filters: FilterState, selectedSlug: string | null): ViewLevel {
	if (selectedSlug) return "focused";
	if (hasActiveFilters(filters)) return "filtered";
	return "overview";
}

function hasActiveFilters(filters: FilterState): boolean {
	return (
		(filters.parties?.length ?? 0) > 0 ||
		(filters.cantons?.length ?? 0) > 0 ||
		(filters.councils?.length ?? 0) > 0 ||
		(filters.industries?.length ?? 0) > 0 ||
		(filters.connectionTypes?.length ?? 0) > 0
	);
}

const MAX_VISIBLE_NODES = 80;

export function computeVisibleNodes(
	graph: Graph,
	filters: FilterState,
	selectedSlug: string | null,
): Set<string> {
	// Focused: ego network
	if (selectedSlug) {
		const selectedNodeId = findNodeBySlug(graph, selectedSlug);
		if (selectedNodeId) {
			return computeEgoNetwork(graph, selectedNodeId);
		}
	}

	// Overview: only party nodes
	if (!hasActiveFilters(filters)) {
		return computeOverviewNodes(graph);
	}

	// Filtered: matching actors + 1-hop neighbors
	return computeFilteredNodes(graph, filters);
}

function findNodeBySlug(graph: Graph, slug: string): string | null {
	for (const node of graph.nodes()) {
		if (graph.getNodeAttribute(node, "slug") === slug) {
			return node;
		}
	}
	return null;
}

function computeOverviewNodes(graph: Graph): Set<string> {
	const visible = new Set<string>();
	for (const node of graph.nodes()) {
		if (graph.getNodeAttribute(node, "actorType") === "party") {
			visible.add(node);
		}
	}
	return visible;
}

function computeEgoNetwork(graph: Graph, nodeId: string): Set<string> {
	const visible = new Set<string>();
	visible.add(nodeId);

	// Add direct neighbors
	for (const neighbor of graph.neighbors(nodeId)) {
		visible.add(neighbor);
	}

	// Add edges between neighbors (neighbor interconnections)
	// The nodes are already in the set; edges between them will naturally show
	return visible;
}

function computeFilteredNodes(graph: Graph, filters: FilterState): Set<string> {
	// Find actors matching ALL active filters (AND logic)
	const matching: string[] = [];

	for (const node of graph.nodes()) {
		if (matchesFilters(graph, node, filters)) {
			matching.push(node);
		}
	}

	// Add 1-hop neighbors
	const withNeighbors = new Set<string>(matching);
	for (const node of matching) {
		for (const neighbor of graph.neighbors(node)) {
			withNeighbors.add(neighbor);
		}
	}

	// Cap at MAX_VISIBLE_NODES by degree centrality
	if (withNeighbors.size <= MAX_VISIBLE_NODES) {
		return withNeighbors;
	}

	// Sort by degree (connection count), keep top N
	const sorted = [...withNeighbors].sort((a, b) => graph.degree(b) - graph.degree(a));
	return new Set(sorted.slice(0, MAX_VISIBLE_NODES));
}

function matchesFilters(graph: Graph, nodeId: string, filters: FilterState): boolean {
	const attrs = graph.getNodeAttributes(nodeId);

	if (filters.parties?.length && !filters.parties.includes(attrs.partyId ?? "")) {
		return false;
	}
	if (filters.cantons?.length && !filters.cantons.includes(attrs.canton ?? "")) {
		return false;
	}
	if (filters.councils?.length && !filters.councils.includes(attrs.council ?? "")) {
		return false;
	}
	if (filters.industries?.length && !filters.industries.includes(attrs.industry ?? "")) {
		return false;
	}

	return true;
}
