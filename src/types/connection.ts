export type ConnectionType =
	| "mandate"
	| "membership"
	| "lobbying"
	| "donation"
	| "board_member"
	| "advisory"
	| "foundation";

export type ConfidenceLevel = "verified" | "declared" | "reported" | "inferred";

export type CompensationStatus = "paid" | "unpaid" | "unknown";

export interface Connection {
	id: string;
	source_actor_id: string;
	target_actor_id: string;
	connection_type: ConnectionType;
	confidence: ConfidenceLevel;
	data_source_id: string;
	role: string;
	compensation_status: CompensationStatus;
	valid_from: string | null;
	valid_until: string | null;
	metadata: Record<string, unknown>;
	created_at: string;
}
