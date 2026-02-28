"use client";

import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SourceTooltipProps = {
	children: React.ReactNode;
	source: string;
	date?: string;
	url?: string;
};

export function SourceTooltip({ children, source, date, url }: SourceTooltipProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="cursor-help border-b border-dotted border-text-muted">{children}</span>
				</TooltipTrigger>
				<TooltipContent className="bg-surface-2 text-text-primary">
					<div className="flex items-center gap-2">
						<span>Quelle: {source}</span>
						{url && (
							<a href={url} target="_blank" rel="noopener noreferrer">
								<ExternalLink className="size-3 text-text-muted" />
							</a>
						)}
					</div>
					{date && <div className="text-text-muted">Stand: {date}</div>}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
