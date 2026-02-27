"use client";

import { useSigma } from "@react-sigma/core";
import { Search, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";

type SearchResult = {
	nodeId: string;
	slug: string;
	label: string;
	actorType: string;
	canton: string | null;
};

export function GraphSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
	const sigma = useSigma();
	const [query, setQuery] = useState("");
	const [, setSearchState] = useQueryStates(graphSearchParams, { shallow: true });
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus input when opened
	useEffect(() => {
		if (open) {
			inputRef.current?.focus();
		} else {
			setQuery("");
		}
	}, [open]);

	// Cmd+K shortcut
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				if (!open) {
					// Parent handles toggling open
				} else {
					inputRef.current?.focus();
				}
			}
			if (e.key === "Escape" && open) {
				onClose();
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	// Search results
	const results = useMemo(() => {
		if (!query || query.length < 2) return [];
		const graph = sigma.getGraph();
		const lowerQuery = query.toLowerCase();
		const matches: SearchResult[] = [];

		for (const node of graph.nodes()) {
			const label = (graph.getNodeAttribute(node, "label") as string) ?? "";
			if (label.toLowerCase().includes(lowerQuery)) {
				matches.push({
					nodeId: node,
					slug: graph.getNodeAttribute(node, "slug") as string,
					label,
					actorType: graph.getNodeAttribute(node, "actorType") as string,
					canton: graph.getNodeAttribute(node, "canton") as string | null,
				});
			}
			if (matches.length >= 10) break;
		}
		return matches;
	}, [query, sigma]);

	const selectResult = useCallback(
		(result: SearchResult) => {
			setSearchState({
				selected: result.slug,
				pathFrom: null,
				pathTo: null,
			});

			// Zoom camera to the node
			const nodeDisplayData = sigma.getNodeDisplayData(result.nodeId);
			if (nodeDisplayData) {
				sigma
					.getCamera()
					.animate({ x: nodeDisplayData.x, y: nodeDisplayData.y, ratio: 0.1 }, { duration: 500 });
			}

			onClose();
		},
		[sigma, setSearchState, onClose],
	);

	if (!open) return null;

	return (
		<div className="absolute left-1/2 top-4 z-40 w-96 max-w-[calc(100%-2rem)] -translate-x-1/2">
			<div className="rounded-lg border border-border-subtle bg-surface-2 shadow-lg">
				{/* Search input */}
				<div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
					<Search size={16} strokeWidth={1.5} className="text-text-muted" />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Akteur suchen..."
						className="flex-1 bg-transparent text-body-sm text-text-primary placeholder:text-text-muted outline-none"
					/>
					<button
						type="button"
						onClick={onClose}
						className="rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
					>
						<X size={14} strokeWidth={1.5} />
					</button>
				</div>

				{/* Results */}
				{results.length > 0 && (
					<div className="max-h-80 overflow-y-auto py-1">
						{results.map((result) => (
							<button
								key={result.nodeId}
								type="button"
								onClick={() => selectResult(result)}
								className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-3"
							>
								<span className="text-body-sm text-text-primary">{result.label}</span>
								<span className="text-caption text-text-muted">
									{ACTOR_TYPE_LABELS[result.actorType] ?? result.actorType}
								</span>
								{result.canton && (
									<span className="text-caption text-text-muted">{result.canton}</span>
								)}
							</button>
						))}
					</div>
				)}

				{query.length >= 2 && results.length === 0 && (
					<div className="px-3 py-4 text-center text-body-sm text-text-muted">
						Keine Ergebnisse gefunden.
					</div>
				)}

				{query.length < 2 && (
					<div className="px-3 py-4 text-center text-caption text-text-muted">
						Mindestens 2 Zeichen eingeben
					</div>
				)}
			</div>
		</div>
	);
}

const ACTOR_TYPE_LABELS: Record<string, string> = {
	person: "Politiker:in",
	organization: "Organisation",
	party: "Partei",
};
