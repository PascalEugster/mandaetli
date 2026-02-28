"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SourceTooltip } from "@/components/ui/source-tooltip";
import { cantonName, formatCouncil, formatSwissDate } from "@/lib/utils/formatters";
import type { Actor } from "@/types/domain";

type PersonHeaderProps = {
	person: Actor;
	party: Actor | null;
	connectionCount: number;
	commissionNames: string[];
};

export function PersonHeader({
	person,
	party,
	connectionCount,
	commissionNames,
}: PersonHeaderProps) {
	return (
		<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
			{/* Photo */}
			<div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-surface-2">
				{person.portrait_url ? (
					<Image
						src={person.portrait_url}
						alt={`${person.first_name} ${person.last_name}`}
						width={96}
						height={96}
						className="size-24 rounded-full object-cover"
					/>
				) : (
					<User className="size-10 text-text-muted" />
				)}
			</div>

			{/* Info */}
			<div className="flex-1 space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-2xl font-bold text-text-primary">
						{person.first_name} {person.last_name}
					</h1>
					{party && (
						<Badge className="text-white" style={{ backgroundColor: party.color ?? "#64748b" }}>
							{party.abbreviation}
						</Badge>
					)}
					{person.canton && <Badge variant="outline">{cantonName(person.canton)}</Badge>}
					{person.council && <Badge variant="secondary">{formatCouncil(person.council)}</Badge>}
				</div>

				<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
					{person.date_of_birth && <span>{formatSwissDate(person.date_of_birth)}</span>}
					{person.language && <span>{person.language}</span>}
					{person.gender && <span>{person.gender}</span>}
				</div>

				{commissionNames.length > 0 && (
					<p className="text-sm text-text-secondary">{commissionNames.join(", ")}</p>
				)}

				<p className="text-sm font-medium text-swiss-red">
					<SourceTooltip source="parlament.ch" date="15.11.2025">
						{connectionCount}
					</SourceTooltip>{" "}
					Verbindungen
				</p>
			</div>
		</div>
	);
}
