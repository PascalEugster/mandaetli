"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SortableHeader } from "@/components/lists/SortableHeader";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ConnectionWithActor } from "@/lib/data/connections";
import { confidenceLabel, connectionTypeLabel } from "@/lib/utils/formatters";

const CONFIDENCE_COLORS: Record<string, string> = {
	verified: "var(--color-confidence-verified)",
	declared: "var(--color-confidence-declared)",
	media_reported: "var(--color-confidence-reported)",
	inferred: "var(--color-confidence-inferred)",
};

type ConnectionListProps = {
	connections: ConnectionWithActor[];
};

function actorHref(actor: { slug: string; actor_type: string }) {
	if (actor.actor_type === "person") return `/person/${actor.slug}`;
	if (actor.actor_type === "organization") return `/organization/${actor.slug}`;
	return `/party/${actor.slug}`;
}

export function ConnectionList({ connections }: ConnectionListProps) {
	const [sortField, setSortField] = useState("name");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [expanded, setExpanded] = useState(false);

	const handleSort = (field: string) => {
		if (field === sortField) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const sorted = useMemo(() => {
		return [...connections].sort((a, b) => {
			let cmp = 0;
			if (sortField === "name") {
				cmp = a.otherActor.name.localeCompare(b.otherActor.name, "de-CH");
			} else if (sortField === "connection_type") {
				cmp = a.connection_type.localeCompare(b.connection_type);
			}
			return sortDir === "asc" ? cmp : -cmp;
		});
	}, [connections, sortField, sortDir]);

	const visible = expanded ? sorted : sorted.slice(0, 10);
	const hasMore = sorted.length > 10;

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<SortableHeader
								label="Name"
								field="name"
								currentSort={sortField}
								currentDir={sortDir}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead>
							<SortableHeader
								label="Typ"
								field="connection_type"
								currentSort={sortField}
								currentDir={sortDir}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead className="hidden md:table-cell">Rolle</TableHead>
						<TableHead>Konfidenz</TableHead>
						<TableHead className="hidden md:table-cell">Bezahlt</TableHead>
						<TableHead className="hidden md:table-cell">Quelle</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{visible.map((conn) => (
						<TableRow key={conn.id}>
							<TableCell>
								<Link
									href={actorHref(conn.otherActor)}
									className="text-text-primary hover:text-swiss-red hover:underline"
								>
									{conn.otherActor.name}
								</Link>
							</TableCell>
							<TableCell className="text-text-secondary">
								{connectionTypeLabel(conn.connection_type)}
							</TableCell>
							<TableCell className="hidden text-text-secondary md:table-cell">
								{conn.role || "-"}
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="gap-1.5">
									<span
										className="inline-block size-2 rounded-full"
										style={{ backgroundColor: CONFIDENCE_COLORS[conn.confidence] }}
									/>
									{confidenceLabel(conn.confidence)}
								</Badge>
							</TableCell>
							<TableCell className="hidden text-text-secondary md:table-cell">
								{conn.is_paid === true ? "Ja" : conn.is_paid === false ? "Nein" : "-"}
							</TableCell>
							<TableCell className="hidden md:table-cell">
								{conn.source_url ? (
									<a
										href={conn.source_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-muted hover:text-swiss-red"
									>
										<ExternalLink className="size-4" />
									</a>
								) : (
									"-"
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{hasMore && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="mt-2 text-sm text-text-secondary hover:text-text-primary"
				>
					{expanded ? "Weniger anzeigen" : `Alle ${sorted.length} anzeigen`}
				</button>
			)}
		</div>
	);
}
