"use client";

import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import Graph from "graphology";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { DetailPanel } from "./DetailPanel";
import { GraphCanvas } from "./GraphCanvas";
import { GraphControls } from "./GraphControls";
import { GraphEventHandler } from "./GraphEventHandler";
import { GraphKeyboardShortcuts } from "./GraphKeyboardShortcuts";
import { GraphLegend } from "./GraphLegend";
import { GraphReducers } from "./GraphReducers";
import { GraphSearch } from "./GraphSearch";
import { GraphToolbar } from "./GraphToolbar";
import { NodeTooltip } from "./NodeTooltip";

// SigmaContainer creates its internal graph with default options (multi: false).
// useLoadGraph imports data into that internal graph via graph.import().
// Our data has multi-edges (same actor pair, different roles), so the internal
// graph must also support multi-edges to avoid "duplicate edge" errors.
class MultiGraph extends Graph {
	constructor() {
		super({ multi: true, type: "undirected" });
	}
}

type NetworkGraphProps = {
	actors: GraphActor[];
	connections: GraphConnection[];
	parties: GraphParty[];
};

export default function NetworkGraph({ actors, connections, parties }: NetworkGraphProps) {
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [legendOpen, setLegendOpen] = useState(true);
	const [searchState] = useQueryStates(graphSearchParams, { shallow: true });

	const filterCount = useMemo(() => {
		let count = 0;
		if (searchState.parties?.length) count += searchState.parties.length;
		if (searchState.cantons?.length) count += searchState.cantons.length;
		if (searchState.councils?.length) count += searchState.councils.length;
		if (searchState.industries?.length) count += searchState.industries.length;
		if (searchState.connectionTypes?.length) count += searchState.connectionTypes.length;
		return count;
	}, [searchState]);

	const handleToggleSearch = useCallback(() => {
		setSearchOpen((prev) => !prev);
		if (!searchOpen) setFiltersOpen(false);
	}, [searchOpen]);

	const handleToggleFilters = useCallback(() => {
		setFiltersOpen((prev) => !prev);
		if (!filtersOpen) setSearchOpen(false);
	}, [filtersOpen]);

	const handleToggleLegend = useCallback(() => {
		setLegendOpen((prev) => !prev);
	}, []);

	return (
		<div className="relative h-full w-full">
			<SigmaContainer
				graph={MultiGraph}
				className="h-full w-full"
				settings={{
					renderEdgeLabels: false,
					defaultEdgeType: "line",
					labelColor: { color: "#f8fafc" },
					labelSize: 12,
					labelFont: "Inter",
					labelRenderedSizeThreshold: 8,
					defaultNodeColor: "#64748b",
					defaultEdgeColor: "#475569",
				}}
			>
				<GraphCanvas actors={actors} connections={connections} parties={parties} />
				<GraphEventHandler />
				<GraphReducers />
				<NodeTooltip />
				<DetailPanel />
				<GraphToolbar
					filterCount={filterCount}
					onToggleFilters={handleToggleFilters}
					onToggleSearch={handleToggleSearch}
				/>
				<GraphControls open={filtersOpen} onClose={() => setFiltersOpen(false)} />
				<GraphSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
				<GraphKeyboardShortcuts
					onToggleFilters={handleToggleFilters}
					onToggleSearch={handleToggleSearch}
					onToggleLegend={handleToggleLegend}
				/>
			</SigmaContainer>
			{legendOpen && <GraphLegend />}
		</div>
	);
}
