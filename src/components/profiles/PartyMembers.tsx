"use client";

import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { SortableHeader } from "@/components/lists/SortableHeader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cantonName, formatCouncil } from "@/lib/utils/formatters";
import type { Actor } from "@/types/domain";

type PartyMembersProps = {
	members: Actor[];
	connectionCounts: Record<string, number>;
};

export function PartyMembers({ members, connectionCounts }: PartyMembersProps) {
	const [sortField, setSortField] = useQueryState("memberSort", parseAsString.withDefault("name"));
	const [sortDir, setSortDir] = useQueryState("memberDir", parseAsString.withDefault("asc"));

	const handleSort = (field: string) => {
		if (field === sortField) {
			setSortDir(sortDir === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const sorted = useMemo(() => {
		const dir = sortDir === "asc" ? 1 : -1;
		return [...members].sort((a, b) => {
			let cmp = 0;
			if (sortField === "name") {
				cmp = a.name.localeCompare(b.name, "de-CH");
			} else if (sortField === "canton") {
				cmp = (a.canton ?? "").localeCompare(b.canton ?? "");
			} else if (sortField === "council") {
				cmp = (a.council ?? "").localeCompare(b.council ?? "");
			} else if (sortField === "connections") {
				cmp = (connectionCounts[a.id] ?? 0) - (connectionCounts[b.id] ?? 0);
			}
			return cmp * dir;
		});
	}, [members, connectionCounts, sortField, sortDir]);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>
						<SortableHeader
							label="Name"
							field="name"
							currentSort={sortField}
							currentDir={sortDir as "asc" | "desc"}
							onSort={handleSort}
						/>
					</TableHead>
					<TableHead className="hidden md:table-cell">
						<SortableHeader
							label="Kanton"
							field="canton"
							currentSort={sortField}
							currentDir={sortDir as "asc" | "desc"}
							onSort={handleSort}
						/>
					</TableHead>
					<TableHead className="hidden md:table-cell">
						<SortableHeader
							label="Rat"
							field="council"
							currentSort={sortField}
							currentDir={sortDir as "asc" | "desc"}
							onSort={handleSort}
						/>
					</TableHead>
					<TableHead>
						<SortableHeader
							label="Verbindungen"
							field="connections"
							currentSort={sortField}
							currentDir={sortDir as "asc" | "desc"}
							onSort={handleSort}
						/>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sorted.map((member) => (
					<TableRow key={member.id}>
						<TableCell>
							<Link
								href={`/person/${member.slug}`}
								className="text-text-primary hover:text-swiss-red hover:underline"
							>
								{member.first_name} {member.last_name}
							</Link>
						</TableCell>
						<TableCell className="hidden text-text-secondary md:table-cell">
							{cantonName(member.canton)}
						</TableCell>
						<TableCell className="hidden text-text-secondary md:table-cell">
							{formatCouncil(member.council)}
						</TableCell>
						<TableCell className="text-text-secondary">
							{connectionCounts[member.id] ?? 0}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
