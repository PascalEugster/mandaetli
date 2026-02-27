"use client";

import { useSigma } from "@react-sigma/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";

const COUNCIL_OPTIONS = [
	{ value: "NR", label: "Nationalrat" },
	{ value: "SR", label: "Standerat" },
];

const CONNECTION_LABELS: Record<string, string> = {
	mandate: "Mandat",
	membership: "Mitgliedschaft",
	lobbying: "Lobbying",
	donation: "Spende",
	employment: "Anstellung",
};

export function GraphControls({ open, onClose }: { open: boolean; onClose: () => void }) {
	const sigma = useSigma();
	const [searchState, setSearchState] = useQueryStates(graphSearchParams, {
		shallow: true,
	});

	// Extract unique values from graph
	const graphData = useMemo(() => {
		const graph = sigma.getGraph();
		const partyMap = new Map<string, { name: string; color: string; count: number }>();
		const cantons = new Set<string>();
		const industries = new Set<string>();

		for (const node of graph.nodes()) {
			const attrs = graph.getNodeAttributes(node);

			if (attrs.actorType === "party") {
				partyMap.set(node, {
					name: attrs.label as string,
					color: attrs.color as string,
					count: 0,
				});
			}

			if (attrs.canton) cantons.add(attrs.canton as string);
			if (attrs.industry && attrs.industry !== "commission") {
				industries.add(attrs.industry as string);
			}
		}

		// Count party members
		for (const node of graph.nodes()) {
			const partyId = graph.getNodeAttribute(node, "partyId") as string | null;
			if (partyId && partyMap.has(partyId)) {
				const party = partyMap.get(partyId);
				if (party) party.count++;
			}
		}

		return {
			parties: [...partyMap.entries()]
				.map(([id, data]) => ({ id, ...data }))
				.sort((a, b) => b.count - a.count),
			cantons: [...cantons].sort(),
			industries: [...industries].sort(),
		};
	}, [sigma]);

	function toggleArrayParam(key: "parties" | "cantons" | "councils" | "industries", value: string) {
		const current = searchState[key] ?? [];
		const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
		setSearchState({ [key]: next.length > 0 ? next : null });
	}

	function clearAll() {
		setSearchState({
			parties: null,
			cantons: null,
			councils: null,
			industries: null,
			connectionTypes: null,
			selected: null,
			pathFrom: null,
			pathTo: null,
		});
	}

	if (!open) return null;

	const activeParties = searchState.parties ?? [];
	const activeCantons = searchState.cantons ?? [];
	const activeCouncils = searchState.councils ?? [];
	const activeIndustries = searchState.industries ?? [];

	return (
		<div className="absolute left-4 top-4 z-40 flex h-[calc(100%-2rem)] w-72 flex-col rounded-lg border border-border-subtle bg-surface-1 shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
				<h3 className="text-body-sm font-semibold text-text-primary">Filter</h3>
				<button
					type="button"
					onClick={onClose}
					className="rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
				>
					<X size={16} strokeWidth={1.5} />
				</button>
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto px-4 py-3">
				{/* Parteien */}
				<FilterSection title="Parteien">
					{graphData.parties.map((party) => (
						<label key={party.id} className="flex cursor-pointer items-center gap-2 py-1">
							<input
								type="checkbox"
								checked={activeParties.includes(party.id)}
								onChange={() => toggleArrayParam("parties", party.id)}
								className="rounded border-border-subtle"
							/>
							<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: party.color }} />
							<span className="flex-1 text-body-sm text-text-secondary">{party.name}</span>
							<span className="text-caption text-text-muted">{party.count}</span>
						</label>
					))}
				</FilterSection>

				{/* Kantone */}
				<FilterSection title="Kantone">
					<div className="flex flex-wrap gap-1">
						{graphData.cantons.map((canton) => (
							<button
								key={canton}
								type="button"
								onClick={() => toggleArrayParam("cantons", canton)}
								className={`rounded px-2 py-0.5 text-caption transition-colors ${
									activeCantons.includes(canton)
										? "bg-swiss-red text-white"
										: "bg-surface-2 text-text-secondary hover:bg-surface-3"
								}`}
							>
								{canton}
							</button>
						))}
					</div>
				</FilterSection>

				{/* Rat */}
				<FilterSection title="Rat">
					<div className="flex gap-1">
						{COUNCIL_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => toggleArrayParam("councils", opt.value)}
								className={`rounded px-3 py-1 text-body-sm transition-colors ${
									activeCouncils.includes(opt.value)
										? "bg-swiss-red text-white"
										: "bg-surface-2 text-text-secondary hover:bg-surface-3"
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</FilterSection>

				{/* Branche */}
				{graphData.industries.length > 0 && (
					<FilterSection title="Branche">
						<div className="flex flex-wrap gap-1">
							{graphData.industries.map((ind) => (
								<button
									key={ind}
									type="button"
									onClick={() => toggleArrayParam("industries", ind)}
									className={`rounded px-2 py-0.5 text-caption transition-colors ${
										activeIndustries.includes(ind)
											? "bg-swiss-red text-white"
											: "bg-surface-2 text-text-secondary hover:bg-surface-3"
									}`}
								>
									{ind}
								</button>
							))}
						</div>
					</FilterSection>
				)}

				{/* Verbindungstyp */}
				<FilterSection title="Verbindungstyp">
					{Object.entries(CONNECTION_LABELS).map(([value, label]) => (
						<label key={value} className="flex cursor-pointer items-center gap-2 py-1">
							<input
								type="checkbox"
								checked={(searchState.connectionTypes ?? []).includes(value)}
								onChange={() => toggleArrayParam("connectionTypes" as "parties", value)}
								className="rounded border-border-subtle"
							/>
							<span className="text-body-sm text-text-secondary">{label}</span>
						</label>
					))}
				</FilterSection>
			</div>

			{/* Footer */}
			<div className="border-t border-border-subtle px-4 py-3">
				<button
					type="button"
					onClick={clearAll}
					className="w-full rounded-md bg-surface-2 py-2 text-body-sm text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
				>
					Alle zurucksetzen
				</button>
			</div>
		</div>
	);
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="mb-4">
			<h4 className="mb-2 text-caption font-medium uppercase tracking-wider text-text-muted">
				{title}
			</h4>
			{children}
		</div>
	);
}
