"use client";

import { useMemo, useState } from "react";
import { SortableHeader } from "@/components/lists/SortableHeader";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { VoteRecordWithVote } from "@/lib/data/votes";
import { formatSwissDate } from "@/lib/utils/formatters";

const DECISION_STYLES: Record<string, { label: string; className: string }> = {
	yes: { label: "Ja", className: "bg-green-600/20 text-green-400 border-green-600/30" },
	no: { label: "Nein", className: "bg-red-600/20 text-red-400 border-red-600/30" },
	abstain: {
		label: "Enthaltung",
		className: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
	},
	absent: { label: "Abwesend", className: "bg-surface-3 text-text-muted border-border-subtle" },
	not_participating: {
		label: "Nicht teilgenommen",
		className: "bg-surface-3 text-text-muted border-border-subtle",
	},
};

type VotingRecordProps = {
	voteRecords: VoteRecordWithVote[];
};

export function VotingRecord({ voteRecords }: VotingRecordProps) {
	const [sortField, setSortField] = useState("date");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [expanded, setExpanded] = useState(false);

	const handleSort = (field: string) => {
		if (field === sortField) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const sorted = useMemo(() => {
		return [...voteRecords].sort((a, b) => {
			let cmp = 0;
			if (sortField === "date") {
				cmp = a.vote.vote_date.localeCompare(b.vote.vote_date);
			} else if (sortField === "topic_category") {
				cmp = (a.vote.topic_category ?? "").localeCompare(b.vote.topic_category ?? "");
			}
			return sortDir === "asc" ? cmp : -cmp;
		});
	}, [voteRecords, sortField, sortDir]);

	const yesCt = voteRecords.filter((r) => r.decision === "yes").length;
	const noCt = voteRecords.filter((r) => r.decision === "no").length;
	const abstainCt = voteRecords.filter((r) => r.decision === "abstain").length;
	const absentCt = voteRecords.length - yesCt - noCt - abstainCt;
	const total = voteRecords.length || 1;

	const visible = expanded ? sorted : sorted.slice(0, 10);
	const hasMore = sorted.length > 10;

	return (
		<div className="space-y-2">
			<p className="text-sm text-text-secondary">{voteRecords.length} Abstimmungen</p>

			{/* Summary bar */}
			{voteRecords.length > 0 && (
				<div className="space-y-1">
					<div className="flex h-2 overflow-hidden rounded-full">
						<div className="bg-green-600" style={{ width: `${(yesCt / total) * 100}%` }} />
						<div className="bg-red-600" style={{ width: `${(noCt / total) * 100}%` }} />
						<div className="bg-yellow-600" style={{ width: `${(abstainCt / total) * 100}%` }} />
						<div className="bg-surface-3" style={{ width: `${(absentCt / total) * 100}%` }} />
					</div>
					<div className="flex gap-3 text-xs text-text-muted">
						<span>{yesCt} Ja</span>
						<span>{noCt} Nein</span>
						<span>{abstainCt} Enthaltung</span>
						<span>{absentCt} Abwesend</span>
					</div>
				</div>
			)}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<SortableHeader
								label="Datum"
								field="date"
								currentSort={sortField}
								currentDir={sortDir}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead>Titel</TableHead>
						<TableHead>Rat</TableHead>
						<TableHead>
							<SortableHeader
								label="Thema"
								field="topic_category"
								currentSort={sortField}
								currentDir={sortDir}
								onSort={handleSort}
							/>
						</TableHead>
						<TableHead>Entscheid</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{visible.map((record) => {
						const style = DECISION_STYLES[record.decision] ?? DECISION_STYLES.absent;
						return (
							<TableRow key={record.id}>
								<TableCell className="text-text-secondary">
									{formatSwissDate(record.vote.vote_date)}
								</TableCell>
								<TableCell className="max-w-xs truncate text-text-primary">
									{record.vote.affair_title}
								</TableCell>
								<TableCell className="text-text-secondary">{record.vote.council}</TableCell>
								<TableCell className="text-text-secondary">
									{record.vote.topic_category ?? "-"}
								</TableCell>
								<TableCell>
									<Badge variant="outline" className={style.className}>
										{style.label}
									</Badge>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			{hasMore && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="mt-2 text-sm text-text-secondary hover:text-text-primary"
				>
					{expanded ? "Weniger anzeigen" : `Alle ${sorted.length} anzeigen`}
				</button>
			)}
		</div>
	);
}
