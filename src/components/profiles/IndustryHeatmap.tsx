"use client";

import { Fragment, useMemo } from "react";

export type IndustryPartyMatrix = {
	industries: string[];
	parties: { abbreviation: string; color: string }[];
	matrix: number[][];
};

type IndustryHeatmapProps = {
	data: IndustryPartyMatrix;
};

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

function hexToRgba(hex: string, opacity: number): string {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function IndustryHeatmap({ data }: IndustryHeatmapProps) {
	const maxCount = useMemo(() => {
		let max = 0;
		for (const row of data.matrix) {
			for (const val of row) {
				if (val > max) max = val;
			}
		}
		return max || 1;
	}, [data.matrix]);

	const cols = data.parties.length;

	return (
		<div className="overflow-x-auto">
			<div
				className="grid gap-px text-xs"
				style={{
					gridTemplateColumns: `140px repeat(${cols}, minmax(60px, 1fr))`,
				}}
			>
				{/* Header row */}
				<div />
				{data.parties.map((party) => (
					<div
						key={party.abbreviation}
						className="flex items-center justify-center gap-1 p-2 text-center text-text-secondary"
					>
						<span
							className="inline-block size-2 rounded-full"
							style={{ backgroundColor: party.color }}
						/>
						{party.abbreviation}
					</div>
				))}

				{/* Data rows */}
				{data.industries.map((industry, rowIdx) => (
					<Fragment key={industry}>
						<div key={`label-${industry}`} className="flex items-center p-2 text-text-secondary">
							{capitalize(industry)}
						</div>
						{data.parties.map((party, colIdx) => {
							const count = data.matrix[rowIdx]?.[colIdx] ?? 0;
							const opacity = count > 0 ? 0.2 + (count / maxCount) * 0.8 : 0;
							return (
								<div
									key={`${industry}-${party.abbreviation}`}
									className="flex items-center justify-center rounded p-2 text-text-primary"
									style={{
										backgroundColor: count > 0 ? hexToRgba(party.color, opacity) : "transparent",
									}}
									title={`${count} Verbindungen zwischen ${party.abbreviation} und ${capitalize(industry)}`}
								>
									{count > 0 ? count : ""}
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
		</div>
	);
}
