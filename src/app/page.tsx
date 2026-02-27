export default function Home() {
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
				<StatCard label="Parlamentarier:innen" value="246" />
				<StatCard label="Organisationen" value="—" />
				<StatCard label="Verbindungen" value="—" />
				<StatCard label="Datenquellen" value="—" />
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

			{/* Data Sources */}
			<section>
				<h2 className="mb-4 text-lg font-semibold text-text-primary">Datenquellen</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<SourceCard
						name="parlament.ch"
						description="Ratsmitglieder und Interessenbindungen"
						status="Bereit"
					/>
					<SourceCard
						name="Zefix / Handelsregister"
						description="Verwaltungsratsmandate und Unternehmensstrukturen"
						status="Bereit"
					/>
					<SourceCard name="Lobbywatch.ch" description="Lobbyismus im Bundeshaus" status="Bereit" />
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

function SourceCard({
	name,
	description,
	status,
}: {
	name: string;
	description: string;
	status: string;
}) {
	return (
		<div className="rounded-lg border border-border-subtle bg-bg-card p-4">
			<div className="flex items-center justify-between">
				<p className="font-medium text-text-primary">{name}</p>
				<span className="rounded-full bg-swiss-red-muted px-2 py-0.5 text-xs text-swiss-red">
					{status}
				</span>
			</div>
			<p className="mt-1 text-sm text-text-muted">{description}</p>
		</div>
	);
}
