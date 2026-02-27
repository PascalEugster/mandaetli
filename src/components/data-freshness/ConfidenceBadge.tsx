import { confidenceDescription, confidenceLabel } from "@/lib/utils/formatters";
import type { ConfidenceLevel } from "@/types";

const badgeStyles: Record<ConfidenceLevel, { dot: string; bg: string; text: string }> = {
	verified: {
		dot: "bg-confidence-verified",
		bg: "bg-confidence-verified/12",
		text: "text-confidence-verified",
	},
	declared: {
		dot: "bg-confidence-declared",
		bg: "bg-confidence-declared/12",
		text: "text-confidence-declared",
	},
	media_reported: {
		dot: "bg-confidence-reported",
		bg: "bg-confidence-reported/12",
		text: "text-confidence-reported",
	},
	inferred: {
		dot: "bg-confidence-inferred",
		bg: "bg-confidence-inferred/12",
		text: "text-confidence-inferred",
	},
};

export function ConfidenceBadge({ level, count }: { level: ConfidenceLevel; count?: number }) {
	const styles = badgeStyles[level];

	if (count !== undefined) {
		return (
			<div
				className="rounded-lg border border-border-subtle bg-surface-1 p-5"
				title={confidenceDescription(level)}
			>
				<div className="mb-2 flex items-center gap-2">
					<span className={`inline-block h-2 w-2 rounded-full ${styles.dot}`} />
					<span className="text-body-sm font-medium text-text-secondary">
						{confidenceLabel(level)}
					</span>
				</div>
				<p className="font-mono text-2xl font-bold text-text-primary">
					{count.toLocaleString("de-CH")}
				</p>
			</div>
		);
	}

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${styles.bg}`}
			title={confidenceDescription(level)}
		>
			<span className={`inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`} />
			<span className={`text-caption font-medium ${styles.text}`}>{confidenceLabel(level)}</span>
		</span>
	);
}
