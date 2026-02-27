"use client";

import { useSigma } from "@react-sigma/core";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";
import { useGraphStore } from "@/stores/graph-store";

type GraphKeyboardShortcutsProps = {
	onToggleFilters: () => void;
	onToggleSearch: () => void;
	onToggleLegend: () => void;
};

export function GraphKeyboardShortcuts({
	onToggleFilters,
	onToggleSearch,
	onToggleLegend,
}: GraphKeyboardShortcutsProps) {
	const sigma = useSigma();
	const [, setSearchState] = useQueryStates(graphSearchParams, { shallow: true });
	const setSelectedEdge = useGraphStore((s) => s.setSelectedEdge);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Skip if user is typing in an input or textarea
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

			switch (e.key) {
				case "Escape":
					e.preventDefault();
					setSearchState({ selected: null, pathFrom: null, pathTo: null });
					setSelectedEdge(null);
					break;
				case "0":
					e.preventDefault();
					sigma.getCamera().animatedReset();
					break;
				case "f":
				case "F":
					e.preventDefault();
					onToggleFilters();
					break;
				case "l":
				case "L":
					e.preventDefault();
					onToggleLegend();
					break;
				case "/":
					e.preventDefault();
					onToggleSearch();
					break;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [sigma, setSearchState, setSelectedEdge, onToggleFilters, onToggleSearch, onToggleLegend]);

	return null;
}
