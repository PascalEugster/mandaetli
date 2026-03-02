"use client";

import { useSetSettings, useSigma } from "@react-sigma/core";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo } from "react";
import type { FilterState } from "@/lib/graph/filters";
import { computeVisibleNodes, deriveViewLevel } from "@/lib/graph/filters";
import { findShortestPath, getPathNodeAndEdgeIds } from "@/lib/graph/paths";
import { graphSearchParams } from "@/lib/graph/search-params";
import { useGraphStore } from "@/stores/graph-store";

/**
 * Applies dim color by reducing opacity.
 * Takes a hex color and returns it with low opacity.
 */
function dimColor(color: string, opacity = 0.2): string {
	if (color.startsWith("#")) {
		const r = Number.parseInt(color.slice(1, 3), 16);
		const g = Number.parseInt(color.slice(3, 5), 16);
		const b = Number.parseInt(color.slice(5, 7), 16);
		return `rgba(${r},${g},${b},${opacity})`;
	}
	if (color.startsWith("rgba")) {
		return color.replace(/,\s*[\d.]+\)$/, `,${opacity})`);
	}
	return color;
}

export function GraphReducers() {
	const sigma = useSigma();
	const setSettings = useSetSettings();
	const hoveredNodeId = useGraphStore((s) => s.hoveredNodeId);
	const graphVersion = useGraphStore((s) => s.graphVersion);
	const [searchState] = useQueryStates(graphSearchParams, { shallow: true });

	const {
		selected,
		pathFrom,
		pathTo,
		parties,
		cantons,
		councils,
		industries,
		connectionTypes,
		actorTypes,
		confidence,
	} = searchState;

	const filters: FilterState = useMemo(
		() => ({ parties, cantons, councils, industries, connectionTypes, actorTypes, confidence }),
		[parties, cantons, councils, industries, connectionTypes, actorTypes, confidence],
	);

	const viewLevel = useMemo(() => deriveViewLevel(filters, selected), [filters, selected]);

	// Compute visible nodes and path info (graphVersion triggers recompute after data loads)
	// biome-ignore lint/correctness/useExhaustiveDependencies: graphVersion intentionally triggers recompute when graph data loads
	const visibleNodes = useMemo(() => {
		const graph = sigma.getGraph();
		if (graph.order === 0) return new Set<string>();
		return computeVisibleNodes(graph, filters, selected);
	}, [sigma, filters, selected, graphVersion]);

	const pathInfo = useMemo(() => {
		if (!pathFrom || !pathTo) return null;
		const graph = sigma.getGraph();

		// Find node IDs from slugs
		let fromId: string | null = null;
		let toId: string | null = null;
		for (const node of graph.nodes()) {
			const slug = graph.getNodeAttribute(node, "slug");
			if (slug === pathFrom) fromId = node;
			if (slug === pathTo) toId = node;
		}
		if (!fromId || !toId) return null;

		const path = findShortestPath(graph, fromId, toId);
		if (!path) return null;

		return getPathNodeAndEdgeIds(graph, path);
	}, [sigma, pathFrom, pathTo]);

	// Compute hovered node neighbors
	const hoveredNeighbors = useMemo(() => {
		if (!hoveredNodeId) return null;
		const graph = sigma.getGraph();
		if (!graph.hasNode(hoveredNodeId)) return null;
		const neighbors = new Set(graph.neighbors(hoveredNodeId));
		neighbors.add(hoveredNodeId);
		return neighbors;
	}, [sigma, hoveredNodeId]);

	// Find selected node ID from slug
	const selectedNodeId = useMemo(() => {
		if (!selected) return null;
		const graph = sigma.getGraph();
		for (const node of graph.nodes()) {
			if (graph.getNodeAttribute(node, "slug") === selected) return node;
		}
		return null;
	}, [sigma, selected]);

	useEffect(() => {
		setSettings({
			nodeReducer: (node, data) => {
				const res = { ...data };

				// Path-finding mode: highlight path, dim rest
				if (pathInfo) {
					if (!pathInfo.nodeIds.has(node)) {
						res.color = dimColor(data.color);
						res.label = null;
						res.zIndex = 0;
					} else {
						res.highlighted = true;
						res.zIndex = 1;
					}
					return res;
				}

				// Visibility based on view level + filters
				if (viewLevel !== "focused" || !selected) {
					// In overview and filtered modes, hide non-visible nodes
					if (!visibleNodes.has(node)) {
						res.hidden = true;
						return res;
					}
				}

				// Selected node: red ring
				if (selectedNodeId === node) {
					res.highlighted = true;
					res.zIndex = 1;
				}

				// Hover dimming: dim non-neighbors
				if (hoveredNeighbors && !hoveredNeighbors.has(node)) {
					res.color = dimColor(data.color);
					res.label = null;
					res.zIndex = 0;
				}

				return res;
			},

			edgeReducer: (edge, data) => {
				const res = { ...data };
				const graph = sigma.getGraph();

				// Path-finding mode
				if (pathInfo) {
					if (!pathInfo.edgeIds.has(edge)) {
						res.color = dimColor(data.color);
						res.hidden = true;
					} else {
						res.zIndex = 1;
					}
					return res;
				}

				// Hide edges where either endpoint is hidden
				const source = graph.source(edge);
				const target = graph.target(edge);

				if (viewLevel !== "focused" || !selected) {
					if (!visibleNodes.has(source) || !visibleNodes.has(target)) {
						res.hidden = true;
						return res;
					}
				}

				// Hide edges that don't match connection type filter
				if (connectionTypes?.length) {
					const edgeType = graph.getEdgeAttribute(edge, "connectionType") as string;
					if (!connectionTypes.includes(edgeType)) {
						res.hidden = true;
						return res;
					}
				}

				// Hide edges that don't match confidence filter
				if (confidence?.length) {
					const edgeConf = graph.getEdgeAttribute(edge, "confidence") as string;
					if (!confidence.includes(edgeConf)) {
						res.hidden = true;
						return res;
					}
				}

				// Hover: dim non-connected edges to 5% opacity
				if (hoveredNeighbors) {
					if (!hoveredNeighbors.has(source) || !hoveredNeighbors.has(target)) {
						res.color = dimColor(data.color, 0.05);
					}
				}

				return res;
			},
		});
	}, [
		setSettings,
		sigma,
		visibleNodes,
		hoveredNeighbors,
		selectedNodeId,
		pathInfo,
		viewLevel,
		selected,
		connectionTypes,
		confidence,
	]);

	return null;
}
