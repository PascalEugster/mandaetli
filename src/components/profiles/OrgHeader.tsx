"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SourceTooltip } from "@/components/ui/source-tooltip";
import type { Actor } from "@/types/domain";

type OrgHeaderProps = {
	org: Actor;
	connectionCount: number;
};

export function OrgHeader({ org, connectionCount }: OrgHeaderProps) {
	return (
		<div className="space-y-2 text-center sm:text-left">
			<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
				<h1 className="text-2xl font-bold text-text-primary">{org.name}</h1>
				{org.industry && <Badge variant="outline">{org.industry}</Badge>}
			</div>

			<div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-text-secondary sm:justify-start">
				{org.legal_form && <span>{org.legal_form}</span>}
				{org.headquarters && <span>{org.headquarters}</span>}
				{org.founded && <span>Gegr. {org.founded}</span>}
				{org.uid && <span>UID: {org.uid}</span>}
			</div>

			{org.website && (
				<a
					href={org.website}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-sm text-swiss-red hover:underline"
				>
					{org.website}
					<ExternalLink className="size-3" />
				</a>
			)}

			<p className="text-sm font-medium text-swiss-red">
				<SourceTooltip source="Handelsregister" date="15.11.2025">
					{connectionCount}
				</SourceTooltip>{" "}
				verbundene Politiker:innen
			</p>
		</div>
	);
}
