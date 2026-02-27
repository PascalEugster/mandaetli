import type { Database } from "./database";

// Row types derived from auto-generated DB types
export type Actor = Database["public"]["Tables"]["actors"]["Row"];
export type Connection = Database["public"]["Tables"]["connections"]["Row"];
export type DataSource = Database["public"]["Tables"]["data_sources"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type VoteRecord = Database["public"]["Tables"]["vote_records"]["Row"];

// Narrowed actor types (discriminated by actor_type)
export type Person = Actor & { actor_type: "person" };
export type Organization = Actor & { actor_type: "organization" };
export type Party = Actor & { actor_type: "party" };

// Enum types derived from DB
export type ActorType = Database["public"]["Enums"]["actor_type"];
export type CouncilType = Database["public"]["Enums"]["council_type"];
export type ConnectionType = Database["public"]["Enums"]["connection_type"];
export type ConfidenceLevel = Database["public"]["Enums"]["confidence_level"];
export type VoteDecision = Database["public"]["Enums"]["vote_decision"];

// Type guards
export function isPerson(actor: Actor): actor is Person {
	return actor.actor_type === "person";
}

export function isOrganization(actor: Actor): actor is Organization {
	return actor.actor_type === "organization";
}

export function isParty(actor: Actor): actor is Party {
	return actor.actor_type === "party";
}
