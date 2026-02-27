import { ConfidenceBadge } from "@/components/data-freshness/ConfidenceBadge";
import { DataSourceCard } from "@/components/data-freshness/DataSourceCard";
import { createClient } from "@/lib/supabase/server";
import { connectionTypeLabel, formatActorName } from "@/lib/utils/formatters";
import type { ConfidenceLevel } from "@/types";

export default async function Home() {
	const supabase = await createClient();

	const [
		{ count: personCount },
		{ count: orgCount },
		{ count: partyCount },
		{ count: connectionCount },
		{ data: dataSources },
		{ data: connections },
		{ data: recentConnections },
	] = await Promise.all([
		supabase.from("actors").select("*", { count: "exact", head: true }).eq("actor_type", "person"),
		supabase
			.from("actors")
			.select("*", { count: "exact", head: true })
			.eq("actor_type", "organization"),
		supabase.from("actors").select("*", { count: "exact", head: true }).eq("actor_type", "party"),
		supabase.from("connections").select("*", { count: "exact", head: true }),
		supabase.from("data_sources").select("*").order("last_synced_at", { ascending: false }),
		supabase.from("connections").select("id, confidence").limit(5000),
		supabase
			.from("connections")
			.select(
				"id, connection_type, role, confidence, created_at, source_actor:actors!connections_source_actor_id_fkey(name, first_name, last_name, actor_type), target_actor:actors!connections_target_actor_id_fkey(name, first_name, last_name, actor_type)",
			)
			.order("created_at", { ascending: false })
			.limit(10),
	]);

	// Count confidence levels
	const confidenceCounts: Record<string, number> = {
		verified: 0,
		declared: 0,
		media_reported: 0,
		inferred: 0,
	};
	for (const c of connections ?? []) {
		if (c.confidence in confidenceCounts) {
			confidenceCounts[c.confidence]++;
		}
	}

	return (
		<div className="px-6 py-8 lg:px-10">
			{/* Hero */}
			<section className="relative mb-10 overflow-hidden rounded-lg bg-surface-1 p-8 lg:p-12">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,0,0,0.06)_0%,_transparent_60%)]" />
				<div className="relative">
					<h1 className="mb-3 text-display font-bold tracking-[-0.02em]">
						<span className="text-text-primary">Seilschaften</span>
						<span className="text-swiss-red">.ch</span>
					</h1>
					<p className="max-w-xl text-text-secondary">
						Alle Verbindungen zwischen Schweizer Politiker:innen, Parteien, Unternehmen und
						Lobbygruppen — transparent und interaktiv visualisiert.
					</p>
					<p className="mt-2 text-body-sm text-text-muted">
						Basierend auf offentlich zuganglichen Daten aus offiziellen Schweizer Registern.
					</p>
				</div>
			</section>

			{/* Statistics Cards (2x2) */}
			<section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard label="Parlamentarier:innen" value={personCount ?? 0} />
				<StatCard label="Organisationen" value={orgCount ?? 0} />
				<StatCard label="Parteien" value={partyCount ?? 0} />
				<StatCard label="Verbindungen" value={connectionCount ?? 0} />
			</section>

			{/* Confidence Distribution */}
			<section className="mb-10">
				<h2 className="mb-4 text-h2 font-semibold tracking-[-0.01em] text-text-primary">
					Verbindungen nach Vertrauensstufe
				</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{(["verified", "declared", "media_reported", "inferred"] as const).map((level) => (
						<ConfidenceBadge
							key={level}
							level={level satisfies ConfidenceLevel}
							count={confidenceCounts[level]}
						/>
					))}
				</div>
			</section>

			{/* Data Sources (horizontal) */}
			<section className="mb-10">
				<h2 className="mb-4 text-h2 font-semibold tracking-[-0.01em] text-text-primary">
					Datenquellen
				</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{(dataSources ?? []).map((ds) => (
						<DataSourceCard key={ds.id} source={ds} />
					))}
				</div>
			</section>

			{/* Recent Connections Table */}
			<section>
				<h2 className="mb-4 text-h2 font-semibold tracking-[-0.01em] text-text-primary">
					Letzte Verbindungen
				</h2>
				<div className="overflow-hidden rounded-lg border border-border-subtle">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border-subtle bg-surface-1">
								<th className="px-4 py-3 text-left text-caption font-medium tracking-wider text-text-muted uppercase">
									Person
								</th>
								<th className="px-4 py-3 text-left text-caption font-medium tracking-wider text-text-muted uppercase">
									Organisation
								</th>
								<th className="hidden px-4 py-3 text-left text-caption font-medium tracking-wider text-text-muted uppercase sm:table-cell">
									Typ
								</th>
								<th className="hidden px-4 py-3 text-left text-caption font-medium tracking-wider text-text-muted uppercase md:table-cell">
									Rolle
								</th>
								<th className="px-4 py-3 text-left text-caption font-medium tracking-wider text-text-muted uppercase">
									Vertrauen
								</th>
							</tr>
						</thead>
						<tbody>
							{(recentConnections ?? []).map((conn) => {
								const source = conn.source_actor as unknown as {
									name: string;
									first_name: string | null;
									last_name: string | null;
									actor_type: string;
								} | null;
								const target = conn.target_actor as unknown as {
									name: string;
									first_name: string | null;
									last_name: string | null;
									actor_type: string;
								} | null;

								return (
									<tr key={conn.id} className="border-b border-border-subtle last:border-b-0">
										<td className="px-4 py-3 text-body-sm text-text-primary">
											{source ? formatActorName(source) : "—"}
										</td>
										<td className="px-4 py-3 text-body-sm text-text-secondary">
											{target?.name ?? "—"}
										</td>
										<td className="hidden px-4 py-3 text-body-sm text-text-tertiary sm:table-cell">
											{connectionTypeLabel(conn.connection_type)}
										</td>
										<td className="hidden px-4 py-3 text-body-sm text-text-tertiary md:table-cell">
											{conn.role}
										</td>
										<td className="px-4 py-3">
											<ConfidenceBadge level={conn.confidence as ConfidenceLevel} />
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-border-subtle bg-surface-1 p-5">
			<p className="font-mono text-[28px] font-bold leading-tight text-text-primary">
				{value.toLocaleString("de-CH")}
			</p>
			<p className="mt-1 text-body-sm text-text-secondary">{label}</p>
		</div>
	);
}
