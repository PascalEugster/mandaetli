export type VotePosition = "yes" | "no" | "abstain" | "absent";

export type TopicCategory =
	| "environment"
	| "healthcare"
	| "finance"
	| "immigration"
	| "defense"
	| "education"
	| "social"
	| "infrastructure"
	| "agriculture"
	| "foreign_policy";

export interface Vote {
	id: string;
	title: string;
	date: string;
	session: string;
	description: string;
	topic_category: TopicCategory;
}

export interface VoteRecord {
	vote_id: string;
	actor_id: string;
	position: VotePosition;
}
