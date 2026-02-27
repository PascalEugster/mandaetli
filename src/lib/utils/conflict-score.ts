import type { VoteRecordWithVote } from "@/lib/data/votes";
import type { Actor, Connection } from "@/types/domain";

/**
 * Mapping from parliamentary vote topic categories to related industries.
 * Used to detect when a politician votes in areas where they hold economic interests.
 */
export const TOPIC_TO_INDUSTRY: Record<string, string[]> = {
	Gesundheit: ["pharma", "medtech", "healthcare", "insurance"],
	Finanzen: ["banking", "insurance", "real_estate"],
	Energie: ["energy"],
	Verkehr: ["transport", "construction"],
	Landwirtschaft: ["agriculture", "food"],
	Bildung: ["education"],
	Verteidigung: ["defense"],
	Telekommunikation: ["telecommunications", "technology"],
	Umwelt: ["energy", "chemicals", "agriculture"],
	Wirtschaft: ["banking", "insurance", "consulting", "retail", "trade_association"],
	Soziales: ["healthcare", "ngo", "insurance"],
	Medien: ["media", "telecommunications"],
};

export type ConflictVote = {
	voteId: string;
	affairTitle: string;
	voteDate: string;
	topicCategory: string;
	decision: string;
	overlappingIndustries: string[];
};

export type ConflictScoreResult = {
	/** 0-100 percentage of votes with potential conflict */
	score: number;
	overlappingVotes: ConflictVote[];
	totalVotes: number;
	connectedIndustries: string[];
};

/**
 * Calculate conflict-of-interest score for a politician.
 *
 * The algorithm:
 * 1. Find all organizations connected to this person and collect their industries
 * 2. For each vote record, map the vote's topic_category to related industries
 * 3. Check if any mapped industries overlap with the person's connected industries
 * 4. Score = (votes with overlap / total votes) * 100
 *
 * This is intentionally simple and transparent per PROF-10.
 */
export function calculateConflictScore(params: {
	personId: string;
	connections: Connection[];
	actors: Actor[];
	voteRecords: VoteRecordWithVote[];
}): ConflictScoreResult {
	const { personId, connections, actors, voteRecords } = params;

	// Step 1: Find connected organization industries
	const actorMap = new Map(actors.map((a) => [a.id, a]));
	const connectedIndustries = new Set<string>();

	for (const conn of connections) {
		const otherId = conn.source_actor_id === personId ? conn.target_actor_id : conn.source_actor_id;
		const otherActor = actorMap.get(otherId);
		if (otherActor?.actor_type === "organization" && otherActor.industry) {
			connectedIndustries.add(otherActor.industry);
		}
	}

	if (connectedIndustries.size === 0 || voteRecords.length === 0) {
		return {
			score: 0,
			overlappingVotes: [],
			totalVotes: voteRecords.length,
			connectedIndustries: [],
		};
	}

	// Step 2-3: Check each vote for industry overlap
	const overlappingVotes: ConflictVote[] = [];

	for (const record of voteRecords) {
		const topic = record.vote.topic_category;
		if (!topic) continue;

		const relatedIndustries = TOPIC_TO_INDUSTRY[topic];
		if (!relatedIndustries) continue;

		const overlapping = relatedIndustries.filter((ind) => connectedIndustries.has(ind));

		if (overlapping.length > 0) {
			overlappingVotes.push({
				voteId: record.vote_id,
				affairTitle: record.vote.affair_title,
				voteDate: record.vote.vote_date,
				topicCategory: topic,
				decision: record.decision,
				overlappingIndustries: overlapping,
			});
		}
	}

	// Step 4: Calculate score
	const score =
		voteRecords.length > 0 ? Math.round((overlappingVotes.length / voteRecords.length) * 100) : 0;

	return {
		score,
		overlappingVotes,
		totalVotes: voteRecords.length,
		connectedIndustries: Array.from(connectedIndustries),
	};
}
