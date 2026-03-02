import type { Metadata } from "next";
import Link from "next/link";
import { ActorCard } from "@/components/lists/ActorCard";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { listPersons } from "@/lib/data/persons";
import { createClient } from "@/lib/supabase/server";
import { cantonName, formatCouncil } from "@/lib/utils/formatters";

export const metadata: Metadata = {
	title: "Politiker:innen - Mandaetli.ch",
};

type Props = {
	searchParams: Promise<{ sort?: string; dir?: string }>;
};

export default async function PersonListPage({ searchParams }: Props) {
	const { sort = "name", dir = "asc" } = await searchParams;

	const sortBy = (["name", "canton", "council", "connections"] as const).includes(
		sort as "name" | "canton" | "council" | "connections",
	)
		? (sort as "name" | "canton" | "council" | "connections")
		: "name";
	const sortDir = dir === "desc" ? "desc" : "asc";

	const dbSortBy = sortBy === "connections" ? "name" : sortBy;
	const persons = await listPersons({ sortBy: dbSortBy, sortDir });

	// Fetch party data for badges
	const supabase = await createClient();
	const { data: parties } = await supabase
		.from("actors")
		.select("id, abbreviation, color")
		.eq("actor_type", "party");
	const partyMap = new Map((parties ?? []).map((p) => [p.id, p]));

	// Fetch connection counts using batched queries to avoid Supabase 1000-row limit
	const personIds = persons.map((p) => p.id);
	const connCounts: Record<string, number> = {};
	const batchSize = 100;
	for (let i = 0; i < personIds.length; i += batchSize) {
		const batch = personIds.slice(i, i + batchSize);
		const { data: conns } = await supabase
			.from("connections")
			.select("source_actor_id")
			.in("source_actor_id", batch)
			.is("valid_until", null)
			.limit(10000);
		if (conns) {
			for (const c of conns) {
				connCounts[c.source_actor_id] = (connCounts[c.source_actor_id] ?? 0) + 1;
			}
		}
	}

	// Sort by connection count if requested
	if (sortBy === "connections") {
		persons.sort((a, b) => {
			const diff = (connCounts[a.id] ?? 0) - (connCounts[b.id] ?? 0);
			return sortDir === "desc" ? -diff : diff;
		});
	}

	function sortLink(field: string) {
		const newDir = field === sortBy && sortDir === "asc" ? "desc" : "asc";
		return `/person?sort=${field}&dir=${newDir}`;
	}

	const arrow = (field: string) => {
		if (field !== sortBy) return "";
		return sortDir === "asc" ? " ↑" : " ↓";
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Politiker:innen</h1>
				<p className="text-sm text-text-secondary">{persons.length} Ratsmitglieder</p>
			</div>

			{/* Mobile card layout */}
			<div className="space-y-2 md:hidden">
				{persons.map((person) => {
					const party = person.party_id ? partyMap.get(person.party_id) : null;
					return (
						<ActorCard
							key={person.id}
							name={`${person.first_name} ${person.last_name}`}
							href={`/person/${person.slug}`}
							badge={
								party
									? { label: party.abbreviation ?? "", color: party.color ?? "#64748b" }
									: undefined
							}
							meta={[
								cantonName(person.canton),
								formatCouncil(person.council),
								`${connCounts[person.id] ?? 0} Verbindungen`,
							].filter(Boolean)}
						/>
					);
				})}
			</div>

			{/* Desktop table layout */}
			<Table className="hidden md:table">
				<TableHeader>
					<TableRow>
						<TableHead>
							<Link href={sortLink("name")} className="hover:text-text-primary">
								Name{arrow("name")}
							</Link>
						</TableHead>
						<TableHead>Partei</TableHead>
						<TableHead>
							<Link href={sortLink("canton")} className="hover:text-text-primary">
								Kanton{arrow("canton")}
							</Link>
						</TableHead>
						<TableHead>
							<Link href={sortLink("council")} className="hover:text-text-primary">
								Rat{arrow("council")}
							</Link>
						</TableHead>
						<TableHead>
							<Link href={sortLink("connections")} className="hover:text-text-primary">
								Verbindungen{arrow("connections")}
							</Link>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{persons.map((person) => {
						const party = person.party_id ? partyMap.get(person.party_id) : null;
						return (
							<TableRow key={person.id}>
								<TableCell>
									<Link
										href={`/person/${person.slug}`}
										className="text-text-primary hover:text-swiss-red hover:underline"
									>
										{person.first_name} {person.last_name}
									</Link>
								</TableCell>
								<TableCell>
									{party && (
										<Badge
											className="text-white"
											style={{ backgroundColor: party.color ?? "#64748b" }}
										>
											{party.abbreviation}
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-text-secondary">{cantonName(person.canton)}</TableCell>
								<TableCell className="text-text-secondary">
									{formatCouncil(person.council)}
								</TableCell>
								<TableCell className="text-text-secondary">{connCounts[person.id] ?? 0}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
