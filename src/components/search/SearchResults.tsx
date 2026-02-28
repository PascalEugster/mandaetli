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
	typeFilter?: string;
};

const TYPE_TABS = [
	{ key: undefined, label: "Alle" },
	{ key: "person", label: "Politiker:innen" },
	{ key: "organization", label: "Organisationen" },
	{ key: "party", label: "Parteien" },
] as const;

export function SearchResults({ query, results, typeFilter }: SearchResultsProps) {
	if (!query) {
		return <p className="text-text-muted">Suchbegriff eingeben</p>;
	}

	if (results.length === 0) {
		return <p className="text-text-muted">Keine Ergebnisse fur &ldquo;{query}&rdquo;</p>;
	}

	// Filter by type if set
	const filtered = typeFilter ? results.filter((r) => r.actor_type === typeFilter) : results;

	// Group by type
	const grouped = new Map<string, SearchResult[]>();
	for (const r of filtered) {
		const list = grouped.get(r.actor_type) ?? [];
		list.push(r);
		grouped.set(r.actor_type, list);
	}

	return (
		<div className="space-y-6">
			{/* Type filter tabs */}
			<div className="flex gap-4 border-b border-border-subtle">
				{TYPE_TABS.map((tab) => {
					const isActive = typeFilter === tab.key || (!typeFilter && tab.key === undefined);
					const href = tab.key
						? `/suche?q=${encodeURIComponent(query)}&type=${tab.key}`
						: `/suche?q=${encodeURIComponent(query)}`;
					return (
						<Link
							key={tab.label}
							href={href}
							className={`pb-2 text-sm transition-colors ${
								isActive
									? "border-b-2 border-swiss-red font-medium text-text-primary"
									: "text-text-muted hover:text-text-primary"
							}`}
						>
							{tab.label}
						</Link>
					);
				})}
			</div>

			{filtered.length === 0 && (
				<p className="text-text-muted">Keine Ergebnisse in dieser Kategorie</p>
			)}

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
									<span className="truncate">
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
