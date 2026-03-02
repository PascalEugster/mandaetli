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

// Custom hover renderer: dark background instead of sigma's default white
function drawDarkNodeHover(
	context: CanvasRenderingContext2D,
	data: { x: number; y: number; size: number; label: string | null; color: string },
	settings: { labelSize: number; labelFont: string; labelWeight: string },
) {
	const { labelSize: size, labelFont: font, labelWeight: weight } = settings;
	context.font = `${weight} ${size}px ${font}`;

	// Draw label background (dark)
	context.fillStyle = "#111827";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 8;
	context.shadowColor = "rgba(0,0,0,0.6)";

	const PADDING = 2;
	if (typeof data.label === "string") {
		const textWidth = context.measureText(data.label).width;
		const boxWidth = Math.round(textWidth + 5);
		const boxHeight = Math.round(size + 2 * PADDING);
		const radius = Math.max(data.size, size / 2) + PADDING;
		const angleRadian = Math.asin(boxHeight / 2 / radius);
		const xDeltaCoord = Math.sqrt(Math.abs(radius ** 2 - (boxHeight / 2) ** 2));

		context.beginPath();
		context.moveTo(data.x + xDeltaCoord, data.y + boxHeight / 2);
		context.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
		context.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
		context.lineTo(data.x + xDeltaCoord, data.y - boxHeight / 2);
		context.arc(data.x, data.y, radius, angleRadian, -angleRadian);
		context.closePath();
		context.fill();
	} else {
		context.beginPath();
		context.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
		context.closePath();
		context.fill();
	}

	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

	// Draw label text
	if (data.label) {
		context.fillStyle = "#f8fafc";
		context.font = `${weight} ${size}px ${font}`;
		context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
	}
}

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
		if (searchState.actorTypes?.length) count += searchState.actorTypes.length;
		if (searchState.confidence?.length) count += searchState.confidence.length;
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
				style={{ backgroundColor: "#080c14" }}
				settings={{
					renderEdgeLabels: false,
					defaultEdgeType: "line",
					labelColor: { color: "#f8fafc" },
					labelSize: 12,
					labelFont: "Inter",
					labelRenderedSizeThreshold: 4,
					labelDensity: 0.15,
					labelGridCellSize: 100,
					defaultNodeColor: "#64748b",
					defaultEdgeColor: "#60a5fa",
					// biome-ignore lint/suspicious/noExplicitAny: sigma's hover function type is complex; simple cast avoids generics boilerplate
					defaultDrawNodeHover: drawDarkNodeHover as any,
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
