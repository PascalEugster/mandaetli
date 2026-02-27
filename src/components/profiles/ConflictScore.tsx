"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ConflictScoreResult } from "@/lib/utils/conflict-score";
import { TOPIC_TO_INDUSTRY } from "@/lib/utils/conflict-score";
import { formatSwissDate } from "@/lib/utils/formatters";

type ConflictScoreProps = {
	score: ConflictScoreResult;
	personName: string;
};

function scoreColor(value: number): string {
	if (value < 20) return "text-green-400";
	if (value < 50) return "text-yellow-400";
	return "text-red-400";
}

const DECISION_LABELS: Record<string, string> = {
	yes: "Ja",
	no: "Nein",
	abstain: "Enthaltung",
	absent: "Abwesend",
	not_participating: "Nicht teilgenommen",
};

export function ConflictScore({ score, personName }: ConflictScoreProps) {
	return (
		<div className="space-y-4">
			{/* Main score */}
			<div>
				<span className={`text-3xl font-bold ${scoreColor(score.score)}`}>{score.score}%</span>
				<p className="mt-1 text-sm text-text-secondary">
					{score.overlappingVotes.length} von {score.totalVotes} Abstimmungen mit
					Interessenuberschneidung
				</p>
			</div>

			{/* Connected industries */}
			{score.connectedIndustries.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{score.connectedIndustries.map((ind) => (
						<Badge key={ind} variant="outline">
							{ind}
						</Badge>
					))}
				</div>
			)}

			{/* Methodology */}
			<Collapsible>
				<CollapsibleTrigger className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
					Methodik
					<ChevronDown className="size-4" />
				</CollapsibleTrigger>
				<CollapsibleContent className="mt-2 space-y-3 text-sm text-text-secondary">
					<p>
						Der Interessenkonflikt-Score berechnet den Anteil der Abstimmungen, bei denen{" "}
						{personName} in Bereichen abgestimmt hat, in denen wirtschaftliche Verbindungen
						bestehen. Es werden die Branchen der verbundenen Organisationen mit den Themenkategorien
						der Abstimmungen verglichen.
					</p>

					{/* Topic-to-industry mapping reference */}
					<div className="overflow-x-auto">
						<table className="w-full text-xs">
							<thead>
								<tr className="border-b border-border-subtle">
									<th className="py-1 pr-4 text-left font-medium text-text-primary">Thema</th>
									<th className="py-1 text-left font-medium text-text-primary">Branchen</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(TOPIC_TO_INDUSTRY).map(([topic, industries]) => (
									<tr key={topic} className="border-b border-border-subtle">
										<td className="py-1 pr-4">{topic}</td>
										<td className="py-1">{industries.join(", ")}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Overlapping votes */}
			{score.overlappingVotes.length > 0 && (
				<Collapsible>
					<CollapsibleTrigger className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
						Uberschneidende Abstimmungen ({score.overlappingVotes.length})
						<ChevronDown className="size-4" />
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2 space-y-2">
						{score.overlappingVotes.map((vote) => (
							<div
								key={vote.voteId}
								className="rounded border border-border-subtle bg-surface-1 p-2 text-sm"
							>
								<div className="flex items-center justify-between gap-2">
									<span className="truncate text-text-primary">{vote.affairTitle}</span>
									<Badge variant="outline" className="shrink-0 text-xs">
										{DECISION_LABELS[vote.decision] ?? vote.decision}
									</Badge>
								</div>
								<div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
									<span>{formatSwissDate(vote.voteDate)}</span>
									<span>{vote.topicCategory}</span>
									<span>Branchen: {vote.overlappingIndustries.join(", ")}</span>
								</div>
							</div>
						))}
					</CollapsibleContent>
				</Collapsible>
			)}
		</div>
	);
}
