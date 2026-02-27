export type { Database } from "./database";

export type {
	Actor,
	ActorType,
	ConfidenceLevel,
	Connection,
	ConnectionType,
	CouncilType,
	DataSource,
	Organization,
	Party,
	Person,
	Vote,
	VoteDecision,
	VoteRecord,
} from "./domain";

export { isOrganization, isParty, isPerson } from "./domain";
