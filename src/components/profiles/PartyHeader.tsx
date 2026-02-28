"use client";

import { SourceTooltip } from "@/components/ui/source-tooltip";
import type { Actor } from "@/types/domain";

type PartyHeaderProps = {
	party: Actor;
	memberCount: number;
};

export function PartyHeader({ party, memberCount }: PartyHeaderProps) {
	const position = party.ideology_position != null ? Number(party.ideology_position) : null;

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="text-2xl font-bold text-text-primary">{party.name}</h1>
				{party.abbreviation && (
					<span className="text-lg font-medium text-text-secondary">({party.abbreviation})</span>
				)}
				{party.color && <div className="size-4 rounded" style={{ backgroundColor: party.color }} />}
			</div>

			{/* Ideology bar */}
			{position != null && (
				<div className="space-y-1">
					<div className="flex justify-between text-xs text-text-muted">
						<span>Links</span>
						<span>Rechts</span>
					</div>
					<div className="relative h-2 rounded-full bg-surface-2">
						<div
							className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-white"
							style={{
								left: `${(position / 10) * 100}%`,
								backgroundColor: party.color ?? "#64748b",
							}}
						/>
					</div>
				</div>
			)}

			<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
				{party.seats_nr != null && party.seats_sr != null && (
					<span>
						{party.seats_nr} Sitze im Nationalrat, {party.seats_sr} Sitze im Standerat
					</span>
				)}
				{party.founded && <span>Gegr. {party.founded}</span>}
			</div>

			<p className="text-sm font-medium text-swiss-red">
				<SourceTooltip source="parlament.ch" date="15.11.2025">
					{memberCount}
				</SourceTooltip>{" "}
				Mitglieder
			</p>
		</div>
	);
}
