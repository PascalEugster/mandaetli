"use client";

import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";
import { useGraphStore } from "@/stores/graph-store";

export function GraphEventHandler() {
	const sigma = useSigma();
	const registerEvents = useRegisterEvents();
	const setHoveredNode = useGraphStore((s) => s.setHoveredNode);
	const setHoveredEdge = useGraphStore((s) => s.setHoveredEdge);
	const setSelectedEdge = useGraphStore((s) => s.setSelectedEdge);
	const [searchState, setSearchState] = useQueryStates(graphSearchParams, {
		shallow: true,
	});

	useEffect(() => {
		registerEvents({
			enterNode: ({ node }) => {
				const pos = sigma.getNodeDisplayData(node);
				if (pos) {
					const viewportPos = sigma.framedGraphToViewport({ x: pos.x, y: pos.y });
					setHoveredNode(node, { x: viewportPos.x, y: viewportPos.y });
				} else {
					setHoveredNode(node);
				}
				// Change cursor
				const container = sigma.getContainer();
				container.style.cursor = "pointer";
			},

			leaveNode: () => {
				setHoveredNode(null);
				const container = sigma.getContainer();
				container.style.cursor = "default";
			},

			clickNode: ({ node }) => {
				const graph = sigma.getGraph();
				const slug = graph.getNodeAttribute(node, "slug") as string | undefined;
				if (!slug) return;

				if (searchState.selected && searchState.selected !== slug) {
					// Two-node selection: path-finding mode
					setSearchState({
						pathFrom: searchState.selected,
						pathTo: slug,
						selected: null,
					});
				} else {
					setSearchState({
						selected: slug,
						pathFrom: null,
						pathTo: null,
					});
				}
			},

			enterEdge: ({ edge }) => {
				setHoveredEdge(edge);
				const container = sigma.getContainer();
				container.style.cursor = "pointer";
			},

			leaveEdge: () => {
				setHoveredEdge(null);
				const container = sigma.getContainer();
				container.style.cursor = "default";
			},

			clickEdge: ({ edge }) => {
				setSelectedEdge(edge);
			},

			clickStage: () => {
				setSearchState({
					selected: null,
					pathFrom: null,
					pathTo: null,
				});
				setSelectedEdge(null);
			},
		});
	}, [
		registerEvents,
		sigma,
		setHoveredNode,
		setHoveredEdge,
		setSelectedEdge,
		searchState,
		setSearchState,
	]);

	// Keyboard shortcuts
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Ignore shortcuts when typing in an input
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

			if (e.key === "Escape") {
				// Cascade: clear selection -> clear path -> clear edge
				if (searchState.selected || searchState.pathFrom || searchState.pathTo) {
					setSearchState({ selected: null, pathFrom: null, pathTo: null });
				}
				setSelectedEdge(null);
			}

			if (e.key === "0") {
				sigma.getCamera().animatedReset();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [sigma, searchState, setSearchState, setSelectedEdge]);

	return null;
}
