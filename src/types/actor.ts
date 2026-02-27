export type ActorType = "person" | "organization" | "party";

export type Council = "NR" | "SR";

export type Gender = "male" | "female" | "other";

export type Language = "de" | "fr" | "it" | "rm";

export type LegalForm = "AG" | "GmbH" | "Verein" | "Stiftung" | "Genossenschaft" | "Einzelfirma";

interface ActorBase {
	id: string;
	slug: string;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface PersonActor extends ActorBase {
	actor_type: "person";
	first_name: string;
	last_name: string;
	party_slug: string;
	canton: string;
	council: Council;
	commissions: string[];
	portrait_url: string | null;
	election_date: string | null;
	birth_year: number | null;
	gender: Gender | null;
	language: Language | null;
}

export interface OrganizationActor extends ActorBase {
	actor_type: "organization";
	industry: string;
	legal_form: LegalForm | null;
	uid: string | null;
	headquarters: string | null;
	website: string | null;
	founding_year: number | null;
}

export interface PartyActor extends ActorBase {
	actor_type: "party";
	abbreviation: string;
	color: string;
	seats_nr: number;
	seats_sr: number;
	ideology_position: number | null;
	founded: number | null;
	website: string | null;
}

export type Actor = PersonActor | OrganizationActor | PartyActor;
