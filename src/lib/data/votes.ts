import { createClient } from "@/lib/supabase/server";
import type { Vote, VoteRecord } from "@/types/domain";

export type VoteRecordWithVote = VoteRecord & {
	vote: Vote;
};

/**
 * Fetch all vote records for a person, joined with full vote details.
 */
export async function getVoteRecordsForPerson(personId: string): Promise<VoteRecordWithVote[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("vote_records")
		.select(
			"*, vote:votes(id, affair_id, affair_title, affair_title_fr, affair_title_it, vote_date, council, topic_category, description, created_at)",
		)
		.eq("actor_id", personId);

	if (error || !data) return [];

	// Supabase returns vote as an object (single relation via vote_id FK)
	return data as unknown as VoteRecordWithVote[];
}
