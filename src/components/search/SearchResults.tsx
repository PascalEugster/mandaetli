import { Building2, Flag, User } from "lucide-react";
import Link from "next/link";
import type { SearchResult } from "@/lib/data/search";

const TYPE_ICONS: Record<string, typeof User> = {
	person: User,
	organization: Building2,
	party: Flag,
};

const TYPE_LABELS: Record<string, string> = {
	person: "Politiker:innen",
	organization: "Organisationen",
	party: "Parteien",
};

function actorHref(result: SearchResult): string {
	if (result.actor_type === "person") return `/person/${result.slug}`;
	if (result.actor_type === "organization") return `/organization/${result.slug}`;
	return `/party/${result.slug}`;
}

type SearchResultsProps = {
	query: string;
	results: SearchResult[];
};

export function SearchResults({ query, results }: SearchResultsProps) {
	if (!query) {
		return <p className="text-text-muted">Suchbegriff eingeben</p>;
	}

	if (results.length === 0) {
		return <p className="text-text-muted">Keine Ergebnisse fur &ldquo;{query}&rdquo;</p>;
	}

	// Group by type
	const grouped = new Map<string, SearchResult[]>();
	for (const r of results) {
		const list = grouped.get(r.actor_type) ?? [];
		list.push(r);
		grouped.set(r.actor_type, list);
	}

	return (
		<div className="space-y-6">
			{Array.from(grouped.entries()).map(([type, items]) => {
				const Icon = TYPE_ICONS[type] ?? User;
				return (
					<div key={type}>
						<h2 className="mb-2 text-lg font-semibold text-text-primary">
							{TYPE_LABELS[type] ?? type}{" "}
							<span className="text-sm font-normal text-text-muted">({items.length})</span>
						</h2>
						<div className="space-y-1">
							{items.map((result) => (
								<Link
									key={result.id}
									href={actorHref(result)}
									className="flex items-center gap-3 rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-1 hover:text-text-primary"
								>
									<Icon size={16} strokeWidth={1.5} className="shrink-0 text-text-muted" />
									<span>
										{result.first_name && result.last_name
											? `${result.first_name} ${result.last_name}`
											: result.name}
									</span>
									{result.actor_type === "person" && result.canton && (
										<span className="text-xs text-text-muted">{result.canton}</span>
									)}
									{result.industry && (
										<span className="text-xs text-text-muted">{result.industry}</span>
									)}
								</Link>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
