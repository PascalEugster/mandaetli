import type { Metadata } from "next";
import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { listOrganizations } from "@/lib/data/organizations";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Organisationen - Seilschaften.ch",
};

type Props = {
	searchParams: Promise<{ sort?: string; dir?: string }>;
};

export default async function OrganizationListPage({ searchParams }: Props) {
	const { sort = "name", dir = "asc" } = await searchParams;

	const sortBy = (["name", "industry"] as const).includes(sort as "name" | "industry")
		? (sort as "name" | "industry")
		: "name";
	const sortDir = dir === "desc" ? "desc" : "asc";

	const organizations = await listOrganizations({ sortBy, sortDir });

	// Fetch connection counts using batched queries to avoid Supabase 1000-row limit
	const supabase = await createClient();
	const orgIds = organizations.map((o) => o.id);
	const connCounts: Record<string, number> = {};
	const batchSize = 100;
	for (let i = 0; i < orgIds.length; i += batchSize) {
		const batch = orgIds.slice(i, i + batchSize);
		const { data: conns } = await supabase
			.from("connections")
			.select("target_actor_id")
			.in("target_actor_id", batch)
			.is("valid_until", null)
			.limit(10000);
		if (conns) {
			for (const c of conns) {
				connCounts[c.target_actor_id] = (connCounts[c.target_actor_id] ?? 0) + 1;
			}
		}
	}

	function sortLink(field: string) {
		const newDir = field === sortBy && sortDir === "asc" ? "desc" : "asc";
		return `/organization?sort=${field}&dir=${newDir}`;
	}

	const arrow = (field: string) => {
		if (field !== sortBy) return "";
		return sortDir === "asc" ? " ↑" : " ↓";
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Organisationen</h1>
				<p className="text-sm text-text-secondary">{organizations.length} Organisationen</p>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<Link href={sortLink("name")} className="hover:text-text-primary">
								Name{arrow("name")}
							</Link>
						</TableHead>
						<TableHead>
							<Link href={sortLink("industry")} className="hover:text-text-primary">
								Branche{arrow("industry")}
							</Link>
						</TableHead>
						<TableHead>Rechtsform</TableHead>
						<TableHead>Sitz</TableHead>
						<TableHead>Verbindungen</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{organizations.map((org) => (
						<TableRow key={org.id}>
							<TableCell>
								<Link
									href={`/organization/${org.slug}`}
									className="text-text-primary hover:text-swiss-red hover:underline"
								>
									{org.name}
								</Link>
							</TableCell>
							<TableCell className="text-text-secondary">{org.industry ?? "-"}</TableCell>
							<TableCell className="text-text-secondary">{org.legal_form ?? "-"}</TableCell>
							<TableCell className="text-text-secondary">{org.headquarters ?? "-"}</TableCell>
							<TableCell className="text-text-secondary">{connCounts[org.id] ?? 0}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
