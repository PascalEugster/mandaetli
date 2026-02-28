"use client";

import { useMemo, useState } from "react";
import { ActorCard } from "@/components/lists/ActorCard";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";

type ConnectionExplorerProps = {
	actors: GraphActor[];
	connections: GraphConnection[];
	parties: GraphParty[];
};

type SortOption = "connections" | "name-asc" | "name-desc";

export function ConnectionExplorer({ actors, connections }: ConnectionExplorerProps) {
	const [selectedParties, setSelectedParties] = useState<Set<string>>(new Set());
	const [sortBy, setSortBy] = useState<SortOption>("connections");
	const [visibleCount, setVisibleCount] = useState(20);

	// Build party lookup
	const partyMap = useMemo(() => {
		const map = new Map<string, GraphActor>();
		for (const a of actors) {
			if (a.actor_type === "party") map.set(a.id, a);
		}
		return map;
	}, [actors]);

	// Build connection counts per actor
	const connCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const c of connections) {
			counts[c.source_actor_id] = (counts[c.source_actor_id] ?? 0) + 1;
			counts[c.target_actor_id] = (counts[c.target_actor_id] ?? 0) + 1;
		}
		return counts;
	}, [connections]);

	// Filter persons
	const persons = useMemo(() => {
		return actors.filter((a) => {
			if (a.actor_type !== "person") return false;
			if (selectedParties.size > 0 && (!a.party_id || !selectedParties.has(a.party_id)))
				return false;
			return true;
		});
	}, [actors, selectedParties]);

	// Sort
	const sorted = useMemo(() => {
		return [...persons].sort((a, b) => {
			if (sortBy === "connections") {
				return (connCounts[b.id] ?? 0) - (connCounts[a.id] ?? 0);
			}
			if (sortBy === "name-asc") {
				return a.name.localeCompare(b.name, "de-CH");
			}
			return b.name.localeCompare(a.name, "de-CH");
		});
	}, [persons, sortBy, connCounts]);

	const visible = sorted.slice(0, visibleCount);
	const hasMore = visibleCount < sorted.length;

	// Get unique parties for filter chips
	const partyChips = useMemo(() => {
		const partyIds = new Set<string>();
		for (const a of actors) {
			if (a.actor_type === "person" && a.party_id) partyIds.add(a.party_id);
		}
		return Array.from(partyIds)
			.map((id) => partyMap.get(id))
			.filter((p): p is GraphActor => p != null)
			.sort((a, b) => (a.abbreviation ?? "").localeCompare(b.abbreviation ?? ""));
	}, [actors, partyMap]);

	function toggleParty(partyId: string) {
		setSelectedParties((prev) => {
			const next = new Set(prev);
			if (next.has(partyId)) next.delete(partyId);
			else next.add(partyId);
			return next;
		});
		setVisibleCount(20);
	}

	return (
		<div className="space-y-4 p-4">
			<h2 className="text-lg font-semibold text-text-primary">Netzwerk-Explorer</h2>

			{/* Party filter chips */}
			<div className="flex flex-wrap gap-2">
				{partyChips.map((party) => {
					const isActive = selectedParties.has(party.id);
					return (
						<button
							key={party.id}
							type="button"
							onClick={() => toggleParty(party.id)}
							className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
							style={{
								backgroundColor: isActive ? (party.color ?? "#64748b") : "transparent",
								borderColor: party.color ?? "#64748b",
								color: isActive ? "#fff" : (party.color ?? "#64748b"),
							}}
						>
							{party.abbreviation}
						</button>
					);
				})}
			</div>

			{/* Sort dropdown */}
			<select
				value={sortBy}
				onChange={(e) => setSortBy(e.target.value as SortOption)}
				className="rounded border border-border-subtle bg-surface-1 px-3 py-1.5 text-sm text-text-primary"
			>
				<option value="connections">Meiste Verbindungen</option>
				<option value="name-asc">Name A-Z</option>
				<option value="name-desc">Name Z-A</option>
			</select>

			<p className="text-xs text-text-muted">{sorted.length} Politiker:innen</p>

			{/* Actor cards */}
			<div className="space-y-2">
				{visible.map((person) => {
					const party = person.party_id ? partyMap.get(person.party_id) : null;
					return (
						<ActorCard
							key={person.id}
							name={
								person.first_name && person.last_name
									? `${person.first_name} ${person.last_name}`
									: person.name
							}
							href={`/person/${person.slug}`}
							badge={
								party
									? { label: party.abbreviation ?? "", color: party.color ?? "#64748b" }
									: undefined
							}
							meta={[
								person.canton ?? undefined,
								`${connCounts[person.id] ?? 0} Verbindungen`,
							].filter((v): v is string => v != null)}
						/>
					);
				})}
			</div>

			{hasMore && (
				<button
					type="button"
					onClick={() => setVisibleCount((c) => c + 20)}
					className="w-full rounded border border-border-subtle py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
				>
					Mehr laden
				</button>
			)}
		</div>
	);
}
