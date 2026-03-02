import { Database, Menu } from "lucide-react";
import Link from "next/link";
import { CopyLinkButton } from "@/components/layout/CopyLinkButton";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export function TopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
	return (
		<header className="sticky top-0 z-50 flex h-16 items-center border-b border-border-subtle bg-surface-0">
			<div className="flex w-full items-center justify-between px-4">
				<div className="flex items-center gap-3">
					{/* Mobile menu button */}
					<button
						type="button"
						onClick={onMenuToggle}
						className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text-primary lg:hidden"
						aria-label="Menu"
					>
						<Menu size={18} strokeWidth={1.5} />
					</button>
					<Link href="/" className="flex items-center">
						<span className="text-lg font-bold tracking-tight">
							<span className="text-text-primary">Mandaetli</span>
							<span className="text-swiss-red">.ch</span>
						</span>
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<GlobalSearch />

					<CopyLinkButton />

					{/* Data status indicator */}
					<div className="flex items-center gap-1.5 text-text-muted" title="Datenquellen aktiv">
						<Database size={14} strokeWidth={1.5} />
						<span className="hidden text-caption sm:inline">5 Quellen</span>
					</div>
				</div>
			</div>
		</header>
	);
}
