"use client";

import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
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

	// Use refs for values accessed inside event callbacks to avoid re-render loops
	const searchStateRef = useRef(searchState);
	searchStateRef.current = searchState;

	const setSearchStateRef = useRef(setSearchState);
	setSearchStateRef.current = setSearchState;

	// Register sigma events once on mount — deps use refs intentionally to avoid re-render loop
	// biome-ignore lint/correctness/useExhaustiveDependencies: event callbacks read from refs to break the re-render cycle
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

				const current = searchStateRef.current;
				if (current.selected && current.selected !== slug) {
					setSearchStateRef.current({
						pathFrom: current.selected,
						pathTo: slug,
						selected: null,
					});
				} else {
					setSearchStateRef.current({
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
				setSearchStateRef.current({
					selected: null,
					pathFrom: null,
					pathTo: null,
				});
				setSelectedEdge(null);
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sigma]);

	// Capture initial camera params from URL (read once, never reactive)
	const initialCameraRef = useRef({
		cx: searchState.cx,
		cy: searchState.cy,
		cz: searchState.cz,
	});
	// Sync camera state to URL params (debounced)
	const cameraTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => {
		const camera = sigma.getCamera();
		const { cx, cy, cz } = initialCameraRef.current;
		// Restore camera from URL on mount
		if (cx != null && cy != null && cz != null) {
			camera.setState({ x: cx, y: cy, ratio: cz });
		}

		const handler = () => {
			if (cameraTimerRef.current) clearTimeout(cameraTimerRef.current);
			cameraTimerRef.current = setTimeout(() => {
				const { x, y, ratio } = camera.getState();
				setSearchStateRef.current({
					cx: Math.round(x * 1000) / 1000,
					cy: Math.round(y * 1000) / 1000,
					cz: Math.round(ratio * 1000) / 1000,
				});
			}, 500);
		};

		camera.on("updated", handler);
		return () => {
			camera.off("updated", handler);
			if (cameraTimerRef.current) clearTimeout(cameraTimerRef.current);
		};
	}, [sigma]);

	// Keyboard shortcuts
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

			if (e.key === "Escape") {
				const current = searchStateRef.current;
				if (current.selected || current.pathFrom || current.pathTo) {
					setSearchStateRef.current({ selected: null, pathFrom: null, pathTo: null });
				}
				setSelectedEdge(null);
			}

			if (e.key === "0") {
				sigma.getCamera().animatedReset();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [sigma, setSelectedEdge]);

	return null;
}
