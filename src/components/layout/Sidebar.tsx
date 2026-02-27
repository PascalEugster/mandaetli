"use client";

import {
	BookOpen,
	Building2,
	ChevronLeft,
	Flag,
	LayoutDashboard,
	Network,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
	disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/netzwerk", label: "Netzwerk", icon: Network },
	{ href: "/person", label: "Politiker:innen", icon: Users, disabled: true },
	{ href: "/organization", label: "Organisationen", icon: Building2, disabled: true },
	{ href: "/party", label: "Parteien", icon: Flag, disabled: true },
	{ href: "/sources", label: "Quellen & Methodik", icon: BookOpen },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
	const pathname = usePathname();

	return (
		<aside
			className={`hidden flex-shrink-0 border-r border-border-subtle bg-surface-0 transition-[width] duration-200 lg:flex lg:flex-col ${
				collapsed ? "w-14" : "w-60"
			}`}
		>
			<nav className="flex flex-1 flex-col gap-1 px-2 py-3">
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					if (item.disabled) {
						return (
							<div
								key={item.href}
								className="flex items-center gap-3 rounded-md px-2.5 py-2 text-text-muted"
								title={collapsed ? item.label : undefined}
							>
								<Icon size={18} strokeWidth={1.5} />
								{!collapsed && (
									<>
										<span className="flex-1 text-body-sm">{item.label}</span>
										<span className="rounded bg-surface-2 px-1.5 py-0.5 text-caption text-text-muted">
											Soon
										</span>
									</>
								)}
							</div>
						);
					}

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
								isActive
									? "border-l-[3px] border-l-swiss-red bg-surface-3 text-text-primary"
									: "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
							}`}
							title={collapsed ? item.label : undefined}
						>
							<Icon size={18} strokeWidth={1.5} />
							{!collapsed && <span className="text-body-sm">{item.label}</span>}
						</Link>
					);
				})}
			</nav>

			{/* Collapse toggle */}
			<div className="border-t border-border-subtle p-2">
				<button
					type="button"
					onClick={onToggle}
					className="flex w-full items-center justify-center rounded-md p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
					aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
				>
					<ChevronLeft
						size={18}
						strokeWidth={1.5}
						className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
					/>
				</button>
			</div>
		</aside>
	);
}
