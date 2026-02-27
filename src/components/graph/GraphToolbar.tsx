"use client";

import { useSigma } from "@react-sigma/core";
import { Filter, Maximize, Minus, Plus, Search } from "lucide-react";

type GraphToolbarProps = {
	filterCount: number;
	onToggleFilters: () => void;
	onToggleSearch: () => void;
};

export function GraphToolbar({ filterCount, onToggleFilters, onToggleSearch }: GraphToolbarProps) {
	const sigma = useSigma();

	return (
		<div className="absolute right-4 top-4 z-30 flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface-2 p-1">
			<ToolbarButton label="Hineinzoomen" onClick={() => sigma.getCamera().animatedZoom()}>
				<Plus size={16} strokeWidth={1.5} />
			</ToolbarButton>

			<ToolbarButton label="Herauszoomen" onClick={() => sigma.getCamera().animatedUnzoom()}>
				<Minus size={16} strokeWidth={1.5} />
			</ToolbarButton>

			<ToolbarButton label="Alles anzeigen" onClick={() => sigma.getCamera().animatedReset()}>
				<Maximize size={16} strokeWidth={1.5} />
			</ToolbarButton>

			<div className="my-0.5 border-t border-border-subtle" />

			<ToolbarButton label="Suche" onClick={onToggleSearch}>
				<Search size={16} strokeWidth={1.5} />
			</ToolbarButton>

			<ToolbarButton label="Filter" onClick={onToggleFilters}>
				<div className="relative">
					<Filter size={16} strokeWidth={1.5} />
					{filterCount > 0 && (
						<span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-swiss-red text-[9px] font-bold text-white">
							{filterCount}
						</span>
					)}
				</div>
			</ToolbarButton>
		</div>
	);
}

function ToolbarButton({
	label,
	onClick,
	children,
}: {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
			title={label}
		>
			{children}
		</button>
	);
}
