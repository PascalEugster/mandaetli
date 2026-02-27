"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = usePathname();

	// Auto-collapse sidebar on graph page to maximize horizontal space
	useEffect(() => {
		if (pathname === "/netzwerk") {
			setSidebarCollapsed(true);
		}
	}, [pathname]);

	return (
		<div className="flex h-screen flex-col">
			<TopBar onMenuToggle={() => setMobileOpen(true)} />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>
				<MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
