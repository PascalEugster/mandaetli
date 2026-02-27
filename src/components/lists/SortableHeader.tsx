"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

type SortableHeaderProps = {
	label: string;
	field: string;
	currentSort: string;
	currentDir: "asc" | "desc";
	onSort: (field: string) => void;
};

export function SortableHeader({
	label,
	field,
	currentSort,
	currentDir,
	onSort,
}: SortableHeaderProps) {
	const isActive = currentSort === field;

	return (
		<button
			type="button"
			onClick={() => onSort(field)}
			className={`inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors ${isActive ? "text-text-primary" : ""}`}
		>
			{label}
			{isActive &&
				(currentDir === "asc" ? (
					<ChevronUp className="size-3.5" />
				) : (
					<ChevronDown className="size-3.5" />
				))}
		</button>
	);
}
