import { getActors, getConnections, getDataSources } from "@/lib/data";

export default async function Home() {
	const [actors, connections, dataSources] = await Promise.all([
		getActors(),
		getConnections(),
		getDataSources(),
	]);

	const personCount = actors.filter((a) => a.actor_type === "person").length;
	const orgCount = actors.filter((a) => a.actor_type === "organization").length;
	const partyCount = actors.filter((a) => a.actor_type === "party").length;

	return (
		<div className="mx-auto max-w-7xl px-4 py-16">
			{/* Hero */}
			<section className="mb-16 text-center">
				<h1 className="mb-4 text-5xl font-bold tracking-tight">
					<span className="text-swiss-red">Seilschaften</span>
					<span className="text-text-secondary">.ch</span>
				</h1>
				<p className="mx-auto max-w-2xl text-lg text-text-secondary">
					Alle Verbindungen zwischen Schweizer Politiker:innen, Parteien, Unternehmen und
					Lobbygruppen — transparent und interaktiv visualisiert.
				</p>
				<p className="mt-2 text-sm text-text-muted">
					Basierend auf offentlich zuganglichen Daten aus offiziellen Schweizer Registern.
				</p>
			</section>

			{/* Statistics Cards */}
			<section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="Parlamentarier:innen" value={personCount.toString()} />
				<StatCard label="Organisationen" value={orgCount.toString()} />
				<StatCard label="Verbindungen" value={connections.length.toLocaleString("de-CH")} />
				<StatCard label="Parteien" value={partyCount.toString()} />
			</section>

			{/* Graph Placeholder */}
			<section className="mb-16">
				<div className="flex h-96 items-center justify-center rounded-lg border border-border-subtle bg-bg-card">
					<div className="text-center">
						<p className="mb-2 text-4xl text-text-muted">&#x2B21;</p>
						<p className="text-text-secondary">Netzwerk-Visualisierung in Entwicklung</p>
						<p className="mt-1 text-sm text-text-muted">
							Interaktiver Force-Directed Graph mit WebGL
						</p>
					</div>
				</div>
			</section>

			{/* Confidence Distribution */}
			<section className="mb-16">
				<h2 className="mb-4 text-lg font-semibold text-text-primary">
					Verbindungen nach Vertrauensstufe
				</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<ConfidenceBadge
						level="verified"
						label="Verifiziert"
						count={connections.filter((c) => c.confidence === "verified").length}
					/>
					<ConfidenceBadge
						level="declared"
						label="Deklariert"
						count={connections.filter((c) => c.confidence === "declared").length}
					/>
					<ConfidenceBadge
						level="reported"
						label="Medienberichte"
						count={connections.filter((c) => c.confidence === "reported").length}
					/>
					<ConfidenceBadge
						level="inferred"
						label="Abgeleitet"
						count={connections.filter((c) => c.confidence === "inferred").length}
					/>
				</div>
			</section>

			{/* Data Sources */}
			<section>
				<h2 className="mb-4 text-lg font-semibold text-text-primary">Datenquellen</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{dataSources.map((ds) => (
						<SourceCard
							key={ds.id}
							name={ds.name}
							description={ds.description}
							lastSynced={ds.last_synced}
						/>
					))}
				</div>
			</section>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border-subtle bg-bg-card p-6">
			<p className="text-3xl font-bold text-text-primary">{value}</p>
			<p className="mt-1 text-sm text-text-secondary">{label}</p>
		</div>
	);
}

const confidenceColors: Record<string, string> = {
	verified: "bg-confidence-verified",
	declared: "bg-confidence-declared",
	reported: "bg-confidence-reported",
	inferred: "bg-confidence-inferred",
};

function ConfidenceBadge({ level, label, count }: { level: string; label: string; count: number }) {
	return (
		<div className="rounded-lg border border-border-subtle bg-bg-card p-4">
			<div className="mb-2 flex items-center gap-2">
				<span className={`inline-block h-2.5 w-2.5 rounded-full ${confidenceColors[level]}`} />
				<span className="text-sm font-medium text-text-primary">{label}</span>
			</div>
			<p className="text-2xl font-bold text-text-primary">{count.toLocaleString("de-CH")}</p>
		</div>
	);
}

function SourceCard({
	name,
	description,
	lastSynced,
}: {
	name: string;
	description: string;
	lastSynced: string;
}) {
	const syncDate = new Date(lastSynced);
	const formatted = syncDate.toLocaleDateString("de-CH", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="rounded-lg border border-border-subtle bg-bg-card p-4">
			<div className="flex items-center justify-between">
				<p className="font-medium text-text-primary">{name}</p>
				<span className="rounded-full bg-swiss-red-muted px-2 py-0.5 text-xs text-swiss-red">
					Aktiv
				</span>
			</div>
			<p className="mt-1 text-sm text-text-muted">{description}</p>
			<p className="mt-2 text-xs text-text-muted">Letzte Synchronisierung: {formatted}</p>
		</div>
	);
}
