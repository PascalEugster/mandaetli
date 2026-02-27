"use client";

import { useSigma } from "@react-sigma/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { graphSearchParams } from "@/lib/graph/search-params";
import { useGraphStore } from "@/stores/graph-store";

const CONNECTION_LABELS: Record<string, string> = {
	mandate: "Mandat",
	membership: "Mitgliedschaft",
	lobbying: "Lobbying",
	donation: "Spende",
	employment: "Anstellung",
};

const CONFIDENCE_LABELS: Record<string, string> = {
	verified: "Verifiziert",
	declared: "Deklariert",
	media_reported: "Medienberichte",
	inferred: "Abgeleitet",
};

const ACTOR_TYPE_LABELS: Record<string, string> = {
	person: "Politiker:in",
	organization: "Organisation",
	party: "Partei",
};

export function DetailPanel() {
	const sigma = useSigma();
	const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
	const setSelectedEdge = useGraphStore((s) => s.setSelectedEdge);
	const [searchState, setSearchState] = useQueryStates(graphSearchParams, {
		shallow: true,
	});

	const { selected, pathFrom, pathTo } = searchState;
	const graph = sigma.getGraph();

	// Determine what to show
	const showEdgeDetail = selectedEdgeId && graph.hasEdge(selectedEdgeId);
	const showNodeDetail = selected && !pathFrom && !pathTo;
	const showPathDetail = pathFrom && pathTo;

	if (!showEdgeDetail && !showNodeDetail && !showPathDetail) return null;

	function handleClose() {
		setSelectedEdge(null);
		setSearchState({ selected: null, pathFrom: null, pathTo: null });
	}

	return (
		<div className="absolute right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border-subtle bg-surface-1 shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
				<h3 className="text-body-sm font-semibold text-text-primary">
					{showEdgeDetail ? "Verbindung" : showPathDetail ? "Pfad" : "Details"}
				</h3>
				<button
					type="button"
					onClick={handleClose}
					className="rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
				>
					<X size={16} strokeWidth={1.5} />
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto px-4 py-3">
				{showEdgeDetail && <EdgeDetail graph={graph} edgeId={selectedEdgeId} />}
				{showNodeDetail && <NodeDetail graph={graph} slug={selected} />}
				{showPathDetail && <PathDetail graph={graph} fromSlug={pathFrom} toSlug={pathTo} />}
			</div>
		</div>
	);
}

function EdgeDetail({
	graph,
	edgeId,
}: {
	graph: ReturnType<ReturnType<typeof useSigma>["getGraph"]>;
	edgeId: string;
}) {
	const attrs = graph.getEdgeAttributes(edgeId);
	const sourceId = graph.source(edgeId);
	const targetId = graph.target(edgeId);
	const sourceLabel = graph.getNodeAttribute(sourceId, "label") as string;
	const targetLabel = graph.getNodeAttribute(targetId, "label") as string;

	return (
		<div className="flex flex-col gap-3">
			<div>
				<p className="text-caption text-text-muted">Typ</p>
				<p className="text-body-sm text-text-primary">
					{CONNECTION_LABELS[attrs.connectionType] ?? attrs.connectionType}
				</p>
			</div>
			{attrs.role && (
				<div>
					<p className="text-caption text-text-muted">Rolle</p>
					<p className="text-body-sm text-text-primary">{attrs.role}</p>
				</div>
			)}
			<div>
				<p className="text-caption text-text-muted">Vertrauen</p>
				<p className="text-body-sm text-text-primary">
					{CONFIDENCE_LABELS[attrs.confidence] ?? attrs.confidence}
				</p>
			</div>
			<div className="border-t border-border-subtle pt-3">
				<p className="text-caption text-text-muted">Zwischen</p>
				<p className="text-body-sm text-text-primary">{sourceLabel}</p>
				<p className="text-caption text-text-muted">und</p>
				<p className="text-body-sm text-text-primary">{targetLabel}</p>
			</div>
		</div>
	);
}

function NodeDetail({
	graph,
	slug,
}: {
	graph: ReturnType<ReturnType<typeof useSigma>["getGraph"]>;
	slug: string;
}) {
	// Find node by slug
	let nodeId: string | null = null;
	for (const node of graph.nodes()) {
		if (graph.getNodeAttribute(node, "slug") === slug) {
			nodeId = node;
			break;
		}
	}
	if (!nodeId) return <p className="text-body-sm text-text-muted">Akteur nicht gefunden.</p>;

	const attrs = graph.getNodeAttributes(nodeId);
	const connections = graph.edges(nodeId);

	return (
		<div className="flex flex-col gap-3">
			<div>
				<p className="text-h2 font-semibold text-text-primary">{attrs.label}</p>
				<p className="text-caption text-text-tertiary">
					{ACTOR_TYPE_LABELS[attrs.actorType] ?? attrs.actorType}
				</p>
			</div>

			{attrs.canton && (
				<div>
					<p className="text-caption text-text-muted">Kanton</p>
					<p className="text-body-sm text-text-primary">{attrs.canton}</p>
				</div>
			)}

			{attrs.council && (
				<div>
					<p className="text-caption text-text-muted">Rat</p>
					<p className="text-body-sm text-text-primary">{attrs.council}</p>
				</div>
			)}

			<div className="border-t border-border-subtle pt-3">
				<p className="text-caption text-text-muted">
					{connections.length} Verbindung{connections.length !== 1 ? "en" : ""}
				</p>
				<div className="mt-2 flex flex-col gap-1.5">
					{connections.slice(0, 20).map((edgeId) => {
						const edgeAttrs = graph.getEdgeAttributes(edgeId);
						const otherNode =
							graph.source(edgeId) === nodeId ? graph.target(edgeId) : graph.source(edgeId);
						const otherLabel = graph.getNodeAttribute(otherNode, "label") as string;

						return (
							<div key={edgeId} className="rounded bg-surface-2 px-2.5 py-1.5">
								<p className="text-body-sm text-text-primary">{otherLabel}</p>
								<p className="text-caption text-text-muted">
									{CONNECTION_LABELS[edgeAttrs.connectionType] ?? edgeAttrs.connectionType}
									{edgeAttrs.role ? ` — ${edgeAttrs.role}` : ""}
								</p>
							</div>
						);
					})}
					{connections.length > 20 && (
						<p className="text-caption text-text-muted">+{connections.length - 20} weitere</p>
					)}
				</div>
			</div>
		</div>
	);
}

function PathDetail({
	graph,
	fromSlug,
	toSlug,
}: {
	graph: ReturnType<ReturnType<typeof useSigma>["getGraph"]>;
	fromSlug: string;
	toSlug: string;
}) {
	// Find nodes by slug
	let fromId: string | null = null;
	let toId: string | null = null;

	for (const node of graph.nodes()) {
		const slug = graph.getNodeAttribute(node, "slug") as string;
		if (slug === fromSlug) fromId = node;
		if (slug === toSlug) toId = node;
	}

	if (!fromId || !toId) {
		return <p className="text-body-sm text-text-muted">Pfad konnte nicht berechnet werden.</p>;
	}

	const fromLabel = graph.getNodeAttribute(fromId, "label") as string;
	const toLabel = graph.getNodeAttribute(toId, "label") as string;

	return (
		<div className="flex flex-col gap-3">
			<div>
				<p className="text-caption text-text-muted">Pfad zwischen</p>
				<p className="text-body-sm font-semibold text-text-primary">{fromLabel}</p>
				<p className="text-caption text-text-muted">und</p>
				<p className="text-body-sm font-semibold text-text-primary">{toLabel}</p>
			</div>
			<p className="text-caption text-text-tertiary">
				Der kürzeste Pfad ist im Graphen hervorgehoben.
			</p>
		</div>
	);
}
