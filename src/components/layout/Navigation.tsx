import Link from "next/link";

const NAV_LINKS = [
	{ href: "/graph", label: "Netzwerk" },
	{ href: "/person", label: "Personen" },
	{ href: "/organization", label: "Organisationen" },
	{ href: "/party", label: "Parteien" },
] as const;

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
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm text-text-secondary transition-colors hover:text-text-primary"
						>
							{link.label}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}
