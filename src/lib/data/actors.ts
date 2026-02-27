import { organizations, parties, persons } from "@/lib/mock/data";
import type { Actor, ActorType, OrganizationActor, PartyActor, PersonActor } from "@/types";

function getAllActors(): Actor[] {
	return [...persons, ...organizations, ...parties];
}

export interface ActorFilters {
	actor_type?: ActorType;
	party_slug?: string;
	canton?: string;
	council?: "NR" | "SR";
	industry?: string;
	search?: string;
}

export async function getActors(filters?: ActorFilters): Promise<Actor[]> {
	let actors = getAllActors();

	if (!filters) return actors;

	if (filters.actor_type) {
		actors = actors.filter((a) => a.actor_type === filters.actor_type);
	}

	if (filters.search) {
		const term = filters.search.toLowerCase();
		actors = actors.filter((a) => a.name.toLowerCase().includes(term));
	}

	if (filters.party_slug) {
		actors = actors.filter((a) => a.actor_type === "person" && a.party_slug === filters.party_slug);
	}

	if (filters.canton) {
		actors = actors.filter((a) => a.actor_type === "person" && a.canton === filters.canton);
	}

	if (filters.council) {
		actors = actors.filter((a) => a.actor_type === "person" && a.council === filters.council);
	}

	if (filters.industry) {
		actors = actors.filter(
			(a) => a.actor_type === "organization" && a.industry === filters.industry,
		);
	}

	return actors;
}

export async function getActorBySlug(slug: string): Promise<Actor | undefined> {
	return getAllActors().find((a) => a.slug === slug);
}

export async function getActorById(id: string): Promise<Actor | undefined> {
	return getAllActors().find((a) => a.id === id);
}

export async function getActorsByType(type: "person"): Promise<PersonActor[]>;
export async function getActorsByType(type: "organization"): Promise<OrganizationActor[]>;
export async function getActorsByType(type: "party"): Promise<PartyActor[]>;
export async function getActorsByType(type: ActorType): Promise<Actor[]> {
	return getAllActors().filter((a) => a.actor_type === type);
}
