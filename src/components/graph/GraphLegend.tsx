"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const NODE_TYPES = [
	{ label: "Politiker:in", color: "#3b82f6" },
	{ label: "Organisation", color: "#22c55e" },
	{ label: "Partei", color: "#a855f7" },
	{ label: "Kommission", color: "#8b5cf6" },
];

const EDGE_TYPES = [
	{ label: "Mandat", color: "#475569" },
	{ label: "Mitgliedschaft", color: "#334155" },
	{ label: "Lobbying", color: "#475569" },
	{ label: "Spende", color: "#f59e0b" },
	{ label: "Anstellung", color: "#334155" },
];

const CONFIDENCE_TYPES = [
	{ label: "Verifiziert", color: "#22c55e" },
	{ label: "Deklariert", color: "#3b82f6" },
	{ label: "Medienberichte", color: "#f59e0b" },
	{ label: "Abgeleitet", color: "#64748b" },
];

export function GraphLegend() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className="absolute bottom-4 left-4 z-30 rounded-md border border-border-subtle bg-surface-2 shadow-lg">
			<button
				type="button"
				onClick={() => setCollapsed(!collapsed)}
				className="flex w-full items-center gap-2 px-3 py-2 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
			>
				<span>Legende</span>
				<ChevronDown
					size={14}
					strokeWidth={1.5}
					className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
				/>
			</button>

			{!collapsed && (
				<div className="border-t border-border-subtle px-3 py-2">
					{/* Node types */}
					<div className="mb-2">
						<p className="mb-1 text-caption font-medium text-text-muted">Akteure</p>
						<div className="flex flex-col gap-1">
							{NODE_TYPES.map((nt) => (
								<div key={nt.label} className="flex items-center gap-2">
									<span
										className="inline-block h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: nt.color }}
									/>
									<span className="text-caption text-text-tertiary">{nt.label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Edge types */}
					<div className="mb-2">
						<p className="mb-1 text-caption font-medium text-text-muted">Verbindungen</p>
						<div className="flex flex-col gap-1">
							{EDGE_TYPES.map((et) => (
								<div key={et.label} className="flex items-center gap-2">
									<span className="inline-block h-0.5 w-4" style={{ backgroundColor: et.color }} />
									<span className="text-caption text-text-tertiary">{et.label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Confidence types */}
					<div>
						<p className="mb-1 text-caption font-medium text-text-muted">Vertrauen</p>
						<div className="flex flex-col gap-1">
							{CONFIDENCE_TYPES.map((ct) => (
								<div key={ct.label} className="flex items-center gap-2">
									<span
										className="inline-block h-2 w-2 rounded-full"
										style={{ backgroundColor: ct.color }}
									/>
									<span className="text-caption text-text-tertiary">{ct.label}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
