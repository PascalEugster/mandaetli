import Link from "next/link";

export function Navigation() {
	return (
		<nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-card/80 backdrop-blur-sm">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-xl font-bold tracking-tight">
						<span className="text-swiss-red">Seilschaften</span>
						<span className="text-text-secondary">.ch</span>
					</span>
				</Link>

				<div className="flex items-center gap-6">
					<Link
						href="/graph"
						className="text-sm text-text-secondary transition-colors hover:text-text-primary"
					>
						Netzwerk
					</Link>
					<Link
						href="/search"
						className="text-sm text-text-secondary transition-colors hover:text-text-primary"
					>
						Suche
					</Link>
				</div>
			</div>
		</nav>
	);
}
