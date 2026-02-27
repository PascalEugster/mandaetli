import type { Metadata } from "next";
import Link from "next/link";
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
	title: "Politiker:innen - Seilschaften.ch",
};

type Props = {
	searchParams: Promise<{ sort?: string; dir?: string }>;
};

export default async function PersonListPage({ searchParams }: Props) {
	const { sort = "name", dir = "asc" } = await searchParams;

	const sortBy = (["name", "canton", "council"] as const).includes(
		sort as "name" | "canton" | "council",
	)
		? (sort as "name" | "canton" | "council")
		: "name";
	const sortDir = dir === "desc" ? "desc" : "asc";

	const persons = await listPersons({ sortBy, sortDir });

	// Fetch party data for badges
	const supabase = await createClient();
	const { data: parties } = await supabase
		.from("actors")
		.select("id, abbreviation, color")
		.eq("actor_type", "party");
	const partyMap = new Map((parties ?? []).map((p) => [p.id, p]));

	// Fetch connection counts
	const personIds = persons.map((p) => p.id);
	const { data: conns } = await supabase
		.from("connections")
		.select("source_actor_id")
		.in("source_actor_id", personIds)
		.is("valid_until", null);
	const connCounts: Record<string, number> = {};
	if (conns) {
		for (const c of conns) {
			connCounts[c.source_actor_id] = (connCounts[c.source_actor_id] ?? 0) + 1;
		}
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

			<Table>
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
						<TableHead>Verbindungen</TableHead>
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
