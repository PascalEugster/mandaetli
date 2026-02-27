import { voteRecords, votes } from "@/lib/mock/data";
import type { Vote, VoteRecord } from "@/types";

export async function getVotes(): Promise<Vote[]> {
	return votes;
}

export async function getVoteById(id: string): Promise<Vote | undefined> {
	return votes.find((v) => v.id === id);
}

export async function getVoteRecords(voteId: string): Promise<VoteRecord[]> {
	return voteRecords.filter((vr) => vr.vote_id === voteId);
}

export async function getVotesByActor(actorId: string): Promise<VoteRecord[]> {
	return voteRecords.filter((vr) => vr.actor_id === actorId);
}
