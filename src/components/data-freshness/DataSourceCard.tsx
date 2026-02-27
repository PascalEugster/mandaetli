import { formatRelativeTime } from "@/lib/utils/formatters";
import type { DataSource } from "@/types";

export function DataSourceCard({ source }: { source: DataSource }) {
	return (
		<div className="rounded-lg border border-border-subtle bg-surface-1 p-5">
			<div className="flex items-center justify-between">
				<p className="font-medium text-text-primary">{source.display_name}</p>
				<span className="rounded-full bg-swiss-red-muted px-2 py-0.5 text-caption font-medium text-swiss-red">
					Aktiv
				</span>
			</div>
			<p className="mt-1 text-body-sm text-text-muted">{source.description}</p>
			<div className="mt-3 flex items-center justify-between text-caption text-text-muted">
				<span className="font-mono">{source.record_count.toLocaleString("de-CH")} Eintrage</span>
				<span>{formatRelativeTime(source.last_synced_at)}</span>
			</div>
		</div>
	);
}
