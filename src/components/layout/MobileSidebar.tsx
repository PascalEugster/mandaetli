"use client";

import { Building2, Flag, LayoutDashboard, Network, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type NavItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
	disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/netzwerk", label: "Netzwerk", icon: Network },
	{ href: "/person", label: "Politiker:innen", icon: Users },
	{ href: "/organization", label: "Organisationen", icon: Building2 },
	{ href: "/party", label: "Parteien", icon: Flag },
];

export function MobileSidebar({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const pathname = usePathname();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="left" className="w-64 bg-surface-0 p-0">
				<SheetHeader className="border-b border-border-subtle px-4 py-4">
					<SheetTitle className="text-lg font-bold tracking-tight">
						<span className="text-text-primary">Seilschaften</span>
						<span className="text-swiss-red">.ch</span>
					</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-1 px-2 py-3">
					{NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;

						if (item.disabled) {
							return (
								<div
									key={item.href}
									className="flex items-center gap-3 rounded-md px-2.5 py-2 text-text-muted"
								>
									<Icon size={18} strokeWidth={1.5} />
									<span className="flex-1 text-body-sm">{item.label}</span>
									<span className="rounded bg-surface-2 px-1.5 py-0.5 text-caption text-text-muted">
										Soon
									</span>
								</div>
							);
						}

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => onOpenChange(false)}
								className={`flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
									isActive
										? "border-l-[3px] border-l-swiss-red bg-surface-3 text-text-primary"
										: "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
								}`}
							>
								<Icon size={18} strokeWidth={1.5} />
								<span className="text-body-sm">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
