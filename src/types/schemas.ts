import { z } from "zod/v4";
import { CANTON_CODES } from "@/lib/utils/constants";

// --- Enums ---

const actorTypeSchema = z.enum(["person", "organization", "party"]);
const councilSchema = z.enum(["NR", "SR"]);
const genderSchema = z.enum(["male", "female", "other"]);
const languageSchema = z.enum(["de", "fr", "it", "rm"]);
const legalFormSchema = z.enum([
	"AG",
	"GmbH",
	"Verein",
	"Stiftung",
	"Genossenschaft",
	"Einzelfirma",
]);

const connectionTypeSchema = z.enum([
	"mandate",
	"membership",
	"lobbying",
	"donation",
	"board_member",
	"advisory",
	"foundation",
]);
const confidenceSchema = z.enum(["verified", "declared", "reported", "inferred"]);
const compensationStatusSchema = z.enum(["paid", "unpaid", "unknown"]);

const votePositionSchema = z.enum(["yes", "no", "abstain", "absent"]);
const topicCategorySchema = z.enum([
	"environment",
	"healthcare",
	"finance",
	"immigration",
	"defense",
	"education",
	"social",
	"infrastructure",
	"agriculture",
	"foreign_policy",
]);

// --- Actors ---

const cantonSchema = z.enum(CANTON_CODES as [string, ...string[]]);

const actorBaseSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const personActorSchema = actorBaseSchema.extend({
	actor_type: z.literal("person"),
	first_name: z.string(),
	last_name: z.string(),
	party_slug: z.string(),
	canton: cantonSchema,
	council: councilSchema,
	commissions: z.array(z.string()),
	portrait_url: z.string().nullable(),
	election_date: z.string().nullable(),
	birth_year: z.number().int().nullable(),
	gender: genderSchema.nullable(),
	language: languageSchema.nullable(),
});

export const organizationActorSchema = actorBaseSchema.extend({
	actor_type: z.literal("organization"),
	industry: z.string(),
	legal_form: legalFormSchema.nullable(),
	uid: z.string().nullable(),
	headquarters: z.string().nullable(),
	website: z.string().nullable(),
	founding_year: z.number().int().nullable(),
});

export const partyActorSchema = actorBaseSchema.extend({
	actor_type: z.literal("party"),
	abbreviation: z.string(),
	color: z.string(),
	seats_nr: z.number().int(),
	seats_sr: z.number().int(),
	ideology_position: z.number().nullable(),
	founded: z.number().int().nullable(),
	website: z.string().nullable(),
});

export const actorSchema = z.discriminatedUnion("actor_type", [
	personActorSchema,
	organizationActorSchema,
	partyActorSchema,
]);

// --- Connections ---

export const connectionSchema = z.object({
	id: z.string(),
	source_actor_id: z.string(),
	target_actor_id: z.string(),
	connection_type: connectionTypeSchema,
	confidence: confidenceSchema,
	data_source_id: z.string(),
	role: z.string(),
	compensation_status: compensationStatusSchema,
	valid_from: z.string().nullable(),
	valid_until: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()),
	created_at: z.string(),
});

// --- Sources ---

export const dataSourceSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.string(),
	description: z.string(),
	last_synced: z.string(),
});

export const sourceAttributionSchema = z.object({
	data_source_id: z.string(),
	retrieval_date: z.string(),
	original_url: z.string().nullable(),
});

// --- Votes ---

export const voteSchema = z.object({
	id: z.string(),
	title: z.string(),
	date: z.string(),
	session: z.string(),
	description: z.string(),
	topic_category: topicCategorySchema,
});

export const voteRecordSchema = z.object({
	vote_id: z.string(),
	actor_id: z.string(),
	position: votePositionSchema,
});

// --- Exported enum schemas for reuse ---

export {
	actorTypeSchema,
	councilSchema,
	genderSchema,
	languageSchema,
	legalFormSchema,
	connectionTypeSchema,
	confidenceSchema,
	compensationStatusSchema,
	votePositionSchema,
	topicCategorySchema,
};
