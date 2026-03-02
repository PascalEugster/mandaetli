"use client";

import { useSigma } from "@react-sigma/core";
import { Building2, ChevronDown, Flag, User, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { graphSearchParams } from "@/lib/graph/search-params";
import { useGraphStore } from "@/stores/graph-store";

type FilterKey =
	| "parties"
	| "cantons"
	| "councils"
	| "industries"
	| "connectionTypes"
	| "actorTypes"
	| "confidence";

const COUNCIL_OPTIONS = [
	{ value: "NR", label: "Nationalrat" },
	{ value: "SR", label: "Standerat" },
];

const CONNECTION_TYPE_CONFIG: { value: string; label: string; color: string }[] = [
	{ value: "mandate", label: "Mandat", color: "#60a5fa" },
	{ value: "membership", label: "Mitgliedschaft", color: "#818cf8" },
	{ value: "lobbying", label: "Lobbying", color: "#f97316" },
	{ value: "donation", label: "Spende", color: "#fbbf24" },
	{ value: "employment", label: "Anstellung", color: "#34d399" },
];

const ACTOR_TYPE_CONFIG: { value: string; label: string; color: string; icon: typeof User }[] = [
	{ value: "person", label: "Politiker:in", color: "#3b82f6", icon: User },
	{ value: "organization", label: "Organisation", color: "#22c55e", icon: Building2 },
	{ value: "party", label: "Partei", color: "#a855f7", icon: Flag },
];

const CONFIDENCE_CONFIG: { value: string; label: string; color: string }[] = [
	{ value: "verified", label: "Verifiziert", color: "#22c55e" },
	{ value: "declared", label: "Deklariert", color: "#3b82f6" },
	{ value: "media_reported", label: "Medienberichte", color: "#f59e0b" },
	{ value: "inferred", label: "Abgeleitet", color: "#64748b" },
];

const FILTER_LABELS: Record<FilterKey, string> = {
	parties: "Partei",
	cantons: "Kanton",
	councils: "Rat",
	industries: "Branche",
	connectionTypes: "Verbindung",
	actorTypes: "Akteurtyp",
	confidence: "Vertrauen",
};

export function GraphControls({ open, onClose }: { open: boolean; onClose: () => void }) {
	const sigma = useSigma();
	const graphVersion = useGraphStore((s) => s.graphVersion);
	const [searchState, setSearchState] = useQueryStates(graphSearchParams, {
		shallow: true,
	});

	// Extract unique values from graph (graphVersion triggers recompute after data loads)
	// biome-ignore lint/correctness/useExhaustiveDependencies: graphVersion intentionally triggers recompute when graph data loads
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
	}, [sigma, graphVersion]);

	function toggleArrayParam(key: FilterKey, value: string) {
		const current = (searchState[key] as string[] | null) ?? [];
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
			actorTypes: null,
			confidence: null,
			selected: null,
			pathFrom: null,
			pathTo: null,
		});
	}

	// Collect active filter chips
	const activeChips: { key: FilterKey; value: string; label: string }[] = [];
	for (const key of [
		"parties",
		"cantons",
		"councils",
		"industries",
		"connectionTypes",
		"actorTypes",
		"confidence",
	] as FilterKey[]) {
		const values = searchState[key] as string[] | null;
		if (values?.length) {
			for (const v of values) {
				let label = v;
				if (key === "parties") {
					label = graphData.parties.find((p) => p.id === v)?.name ?? v;
				} else if (key === "connectionTypes") {
					label = CONNECTION_TYPE_CONFIG.find((c) => c.value === v)?.label ?? v;
				} else if (key === "actorTypes") {
					label = ACTOR_TYPE_CONFIG.find((a) => a.value === v)?.label ?? v;
				} else if (key === "confidence") {
					label = CONFIDENCE_CONFIG.find((c) => c.value === v)?.label ?? v;
				} else if (key === "councils") {
					label = COUNCIL_OPTIONS.find((c) => c.value === v)?.label ?? v;
				}
				activeChips.push({ key, value: v, label });
			}
		}
	}

	if (!open) return null;

	const activeParties = searchState.parties ?? [];
	const activeCantons = searchState.cantons ?? [];
	const activeCouncils = searchState.councils ?? [];
	const activeIndustries = searchState.industries ?? [];
	const activeConnectionTypes = searchState.connectionTypes ?? [];
	const activeActorTypes = searchState.actorTypes ?? [];
	const activeConfidence = searchState.confidence ?? [];

	return (
		<div className="absolute left-4 top-4 z-40 flex h-[calc(100%-2rem)] w-80 flex-col rounded-lg border border-border-subtle bg-surface-1 shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
				<div className="flex items-center gap-2">
					<h3 className="text-body-sm font-semibold text-text-primary">Filter</h3>
					{activeChips.length > 0 && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-swiss-red px-1.5 text-[10px] font-medium text-white">
							{activeChips.length}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
				>
					<X size={16} strokeWidth={1.5} />
				</button>
			</div>

			{/* Active filter chips */}
			{activeChips.length > 0 && (
				<div className="flex flex-wrap gap-1.5 border-b border-border-subtle px-4 py-2.5">
					{activeChips.map((chip) => (
						<button
							key={`${chip.key}-${chip.value}`}
							type="button"
							onClick={() => toggleArrayParam(chip.key, chip.value)}
							className="flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] text-text-secondary transition-colors hover:bg-surface-2"
						>
							<span className="text-text-muted">{FILTER_LABELS[chip.key]}:</span>
							<span>{chip.label}</span>
							<X size={10} strokeWidth={2} className="ml-0.5 text-text-muted" />
						</button>
					))}
				</div>
			)}

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto">
				{/* Akteurtyp */}
				<CollapsibleSection title="Akteurtyp" count={activeActorTypes.length} defaultOpen>
					<div className="flex flex-col gap-1">
						{ACTOR_TYPE_CONFIG.map((at) => {
							const Icon = at.icon;
							const isActive = activeActorTypes.includes(at.value);
							return (
								<button
									key={at.value}
									type="button"
									onClick={() => toggleArrayParam("actorTypes", at.value)}
									className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-body-sm transition-colors ${
										isActive
											? "bg-surface-3 text-text-primary"
											: "text-text-secondary hover:bg-surface-2"
									}`}
								>
									<Icon size={14} strokeWidth={1.5} style={{ color: at.color }} />
									<span className="flex-1 text-left">{at.label}</span>
									{isActive && <span className="h-1.5 w-1.5 rounded-full bg-swiss-red" />}
								</button>
							);
						})}
					</div>
				</CollapsibleSection>

				{/* Parteien */}
				<CollapsibleSection title="Parteien" count={activeParties.length} defaultOpen>
					{graphData.parties.map((party) => {
						const isActive = activeParties.includes(party.id);
						return (
							<button
								key={party.id}
								type="button"
								onClick={() => toggleArrayParam("parties", party.id)}
								className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-body-sm transition-colors ${
									isActive
										? "bg-surface-3 text-text-primary"
										: "text-text-secondary hover:bg-surface-2"
								}`}
							>
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: party.color }}
								/>
								<span className="flex-1 text-left">{party.name}</span>
								<span className="text-caption text-text-muted">{party.count}</span>
								{isActive && <span className="h-1.5 w-1.5 rounded-full bg-swiss-red" />}
							</button>
						);
					})}
				</CollapsibleSection>

				{/* Verbindungstyp */}
				<CollapsibleSection title="Verbindungstyp" count={activeConnectionTypes.length} defaultOpen>
					<div className="flex flex-col gap-1">
						{CONNECTION_TYPE_CONFIG.map((ct) => {
							const isActive = activeConnectionTypes.includes(ct.value);
							return (
								<button
									key={ct.value}
									type="button"
									onClick={() => toggleArrayParam("connectionTypes", ct.value)}
									className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-body-sm transition-colors ${
										isActive
											? "bg-surface-3 text-text-primary"
											: "text-text-secondary hover:bg-surface-2"
									}`}
								>
									<span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: ct.color }} />
									<span className="flex-1 text-left">{ct.label}</span>
									{isActive && <span className="h-1.5 w-1.5 rounded-full bg-swiss-red" />}
								</button>
							);
						})}
					</div>
				</CollapsibleSection>

				{/* Vertrauen */}
				<CollapsibleSection title="Vertrauen" count={activeConfidence.length}>
					<div className="flex flex-col gap-1">
						{CONFIDENCE_CONFIG.map((cf) => {
							const isActive = activeConfidence.includes(cf.value);
							return (
								<button
									key={cf.value}
									type="button"
									onClick={() => toggleArrayParam("confidence", cf.value)}
									className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-body-sm transition-colors ${
										isActive
											? "bg-surface-3 text-text-primary"
											: "text-text-secondary hover:bg-surface-2"
									}`}
								>
									<span className="h-2 w-2 rounded-full" style={{ backgroundColor: cf.color }} />
									<span className="flex-1 text-left">{cf.label}</span>
									{isActive && <span className="h-1.5 w-1.5 rounded-full bg-swiss-red" />}
								</button>
							);
						})}
					</div>
				</CollapsibleSection>

				{/* Kantone */}
				<CollapsibleSection title="Kantone" count={activeCantons.length}>
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
				</CollapsibleSection>

				{/* Rat */}
				<CollapsibleSection title="Rat" count={activeCouncils.length}>
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
				</CollapsibleSection>

				{/* Branche */}
				{graphData.industries.length > 0 && (
					<CollapsibleSection title="Branche" count={activeIndustries.length}>
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
					</CollapsibleSection>
				)}
			</div>

			{/* Footer */}
			{activeChips.length > 0 && (
				<div className="border-t border-border-subtle px-4 py-3">
					<button
						type="button"
						onClick={clearAll}
						className="w-full rounded-md bg-surface-2 py-2 text-body-sm text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
					>
						Alle zurücksetzen
					</button>
				</div>
			)}
		</div>
	);
}

function CollapsibleSection({
	title,
	count,
	defaultOpen = false,
	children,
}: {
	title: string;
	count: number;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-border-subtle">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
			>
				<ChevronDown
					size={12}
					strokeWidth={2}
					className={`text-text-muted transition-transform ${open ? "" : "-rotate-90"}`}
				/>
				<span className="flex-1 text-caption font-medium uppercase tracking-wider text-text-muted">
					{title}
				</span>
				{count > 0 && (
					<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-swiss-red/20 px-1 text-[10px] font-medium text-swiss-red">
						{count}
					</span>
				)}
			</button>
			{open && <div className="px-4 pb-3">{children}</div>}
		</div>
	);
}
