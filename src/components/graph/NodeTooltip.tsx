"use client";

import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
import { useGraphStore } from "@/stores/graph-store";

const ACTOR_TYPE_LABELS: Record<string, string> = {
	person: "Politiker:in",
	organization: "Organisation",
	party: "Partei",
};

const HOVER_DELAY_MS = 300;

export function NodeTooltip() {
	const hoveredNodeId = useGraphStore((s) => s.hoveredNodeId);
	const tooltipPosition = useGraphStore((s) => s.tooltipPosition);
	const hoverTimestamp = useGraphStore((s) => s.hoverTimestamp);
	const sigma = useSigma();
	const [visible, setVisible] = useState(false);

	// 300ms hover delay to prevent flicker in dense areas
	useEffect(() => {
		if (!hoveredNodeId) {
			setVisible(false);
			return;
		}

		const elapsed = Date.now() - hoverTimestamp;
		if (elapsed >= HOVER_DELAY_MS) {
			setVisible(true);
			return;
		}

		const timer = setTimeout(() => setVisible(true), HOVER_DELAY_MS - elapsed);
		return () => clearTimeout(timer);
	}, [hoveredNodeId, hoverTimestamp]);

	if (!visible || !hoveredNodeId || !tooltipPosition) return null;

	const graph = sigma.getGraph();
	if (!graph.hasNode(hoveredNodeId)) return null;

	const attrs = graph.getNodeAttributes(hoveredNodeId);
	const label = attrs.label as string;
	const actorType = attrs.actorType as string;
	const canton = attrs.canton as string | null;
	const council = attrs.council as string | null;
	const connectionCount = graph.degree(hoveredNodeId);
	const abbreviation = attrs.abbreviation as string | null;
	const borderColor = attrs.borderColor as string | undefined;

	// Get top 3 connections
	const topConnections: { label: string; type: string }[] = [];
	const edges = graph.edges(hoveredNodeId);
	for (let i = 0; i < Math.min(3, edges.length); i++) {
		const edgeId = edges[i];
		const otherNode =
			graph.source(edgeId) === hoveredNodeId ? graph.target(edgeId) : graph.source(edgeId);
		topConnections.push({
			label: graph.getNodeAttribute(otherNode, "label") as string,
			type: graph.getEdgeAttribute(edgeId, "connectionType") as string,
		});
	}

	return (
		<div
			className="pointer-events-none absolute z-50 w-[280px] overflow-hidden rounded-md border border-border-subtle shadow-lg backdrop-blur-sm"
			style={{
				left: tooltipPosition.x + 12,
				top: tooltipPosition.y + 8,
				backgroundColor: "rgba(26,34,54,0.95)",
				borderTopColor: borderColor ?? "transparent",
				borderTopWidth: borderColor ? 3 : 1,
			}}
		>
			<div className="px-3 py-2.5">
				{/* Name + type */}
				<p className="text-body-sm font-semibold text-text-primary">{label}</p>
				<div className="mt-1 flex items-center gap-2">
					<span className="text-caption text-text-tertiary">
						{ACTOR_TYPE_LABELS[actorType] ?? actorType}
					</span>
					{abbreviation && actorType === "person" && (
						<>
							<span className="text-caption text-text-muted">·</span>
							<span className="text-caption text-text-secondary">{abbreviation}</span>
						</>
					)}
					{canton && (
						<>
							<span className="text-caption text-text-muted">·</span>
							<span className="text-caption text-text-tertiary">{canton}</span>
						</>
					)}
					{council && (
						<>
							<span className="text-caption text-text-muted">·</span>
							<span className="text-caption text-text-tertiary">{council}</span>
						</>
					)}
				</div>

				{/* Connection count */}
				<div className="mt-2 border-t border-border-subtle pt-2">
					<span className="text-caption text-text-muted">
						{connectionCount} Verbindung{connectionCount !== 1 ? "en" : ""}
					</span>
				</div>

				{/* Top connections */}
				{topConnections.length > 0 && (
					<div className="mt-1.5 flex flex-col gap-0.5">
						{topConnections.map((conn, i) => (
							<div key={`${conn.label}-${i}`} className="flex items-center gap-1.5">
								<span className="text-caption text-text-tertiary">{conn.label}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
