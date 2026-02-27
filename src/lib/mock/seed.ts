/**
 * Mock data seed script for Seilschaften.ch
 *
 * Run with: npx tsx src/lib/mock/seed.ts
 *
 * Generates realistic Swiss political data:
 * - 246 council members (200 NR + 46 SR)
 * - ~500 organizations
 * - 50 parties (7 major + 43 minor)
 * - ~2000+ connections with source attribution
 * - ~20 votes with voting records
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker/locale/de_CH";
import type {
	CompensationStatus,
	ConfidenceLevel,
	ConnectionType,
	Gender,
	Language,
	LegalForm,
	TopicCategory,
} from "@/types";
import type { OrganizationActor, PartyActor, PersonActor } from "@/types/actor";
import type { Connection } from "@/types/connection";
import type { DataSource } from "@/types/source";
import type { Vote, VoteRecord } from "@/types/vote";
import {
	BILINGUAL_CANTONS,
	COMMISSIONS,
	DATA_SOURCES,
	FRENCH_CANTONS,
	INDUSTRIES,
	ITALIAN_CANTONS,
	NR_PARTY_SEATS,
	NR_SEATS_PER_CANTON,
	PARTIES,
	SR_SEATS_PER_CANTON,
} from "../utils/constants";

// Seed for reproducibility
faker.seed(42);

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "data");

// ---- Helpers ----

function generateId(): string {
	return faker.string.uuid();
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function now(): string {
	return "2026-02-27T00:00:00Z";
}

function cantonLanguage(canton: string): Language {
	if ((FRENCH_CANTONS as readonly string[]).includes(canton)) return "fr";
	if ((ITALIAN_CANTONS as readonly string[]).includes(canton)) return "it";
	if ((BILINGUAL_CANTONS as readonly string[]).includes(canton)) {
		return faker.helpers.arrayElement(["de", "fr"] as Language[]);
	}
	return "de";
}

// French and Italian name generators
const frenchFirstNamesMale = [
	"Jean",
	"Pierre",
	"Michel",
	"François",
	"Philippe",
	"Laurent",
	"Alain",
	"Jacques",
	"Christophe",
	"Patrick",
	"Nicolas",
	"Thierry",
	"Olivier",
	"Stéphane",
	"Frédéric",
	"Marc",
	"Claude",
	"Daniel",
	"Yves",
	"André",
];
const frenchFirstNamesFemale = [
	"Marie",
	"Isabelle",
	"Catherine",
	"Sophie",
	"Nathalie",
	"Christine",
	"Valérie",
	"Anne",
	"Florence",
	"Claire",
	"Céline",
	"Monique",
	"Sylvie",
	"Véronique",
	"Brigitte",
	"Corinne",
	"Françoise",
	"Dominique",
	"Sandrine",
	"Martine",
];
const frenchLastNames = [
	"Dupont",
	"Martin",
	"Favre",
	"Rochat",
	"Blanc",
	"Reymond",
	"Berset",
	"Recordon",
	"Chevalley",
	"Vuilleumier",
	"Bourgeois",
	"Tissot",
	"Bonvin",
	"Pelet",
	"Joly",
	"Moret",
	"Perret",
	"Chapuis",
	"Nicolet",
	"Gonin",
];
const italianFirstNamesMale = [
	"Marco",
	"Giovanni",
	"Alessandro",
	"Andrea",
	"Luca",
	"Roberto",
	"Matteo",
	"Paolo",
	"Lorenzo",
	"Giuseppe",
];
const italianFirstNamesFemale = [
	"Francesca",
	"Giulia",
	"Maria",
	"Laura",
	"Paola",
	"Anna",
	"Chiara",
	"Elena",
	"Marta",
	"Sara",
];
const italianLastNames = [
	"Regazzi",
	"Bianchi",
	"Romano",
	"Colombo",
	"Ferrari",
	"Rossi",
	"Bentivoglio",
	"Carobbio",
	"Marchesi",
	"Pedrina",
];

function generateSwissName(
	lang: Language,
	gender: Gender,
): { firstName: string; lastName: string } {
	if (lang === "fr") {
		const firstName =
			gender === "male"
				? faker.helpers.arrayElement(frenchFirstNamesMale)
				: faker.helpers.arrayElement(frenchFirstNamesFemale);
		const lastName = faker.helpers.arrayElement(frenchLastNames);
		return { firstName, lastName };
	}
	if (lang === "it") {
		const firstName =
			gender === "male"
				? faker.helpers.arrayElement(italianFirstNamesMale)
				: faker.helpers.arrayElement(italianFirstNamesFemale);
		const lastName = faker.helpers.arrayElement(italianLastNames);
		return { firstName, lastName };
	}
	// German
	return {
		firstName:
			gender === "male" ? faker.person.firstName("male") : faker.person.firstName("female"),
		lastName: faker.person.lastName(),
	};
}

// ---- Generate Parties ----

function generateParties(): PartyActor[] {
	const majorParties: PartyActor[] = PARTIES.map((p) => ({
		id: generateId(),
		slug: p.slug,
		name: p.name,
		actor_type: "party" as const,
		abbreviation: p.abbreviation,
		color: p.color,
		seats_nr: p.seats_nr,
		seats_sr: p.seats_sr,
		ideology_position: p.ideology_position,
		founded: p.founded,
		website: `https://www.${p.slug}.ch`,
		created_at: now(),
		updated_at: now(),
	}));

	// Minor parties
	const minorPartyNames = [
		{ name: "Lega dei Ticinesi", abbr: "Lega", color: "#1E3A5F", ideology: 7.5 },
		{ name: "Mouvement Citoyens Genevois", abbr: "MCG", color: "#FFD700", ideology: 6.0 },
		{ name: "Eidgenössisch-Demokratische Union", abbr: "EDU", color: "#6B3FA0", ideology: 9.0 },
		{ name: "Partei der Arbeit", abbr: "PdA", color: "#8B0000", ideology: 1.0 },
		{ name: "BastA!", abbr: "BastA", color: "#E60000", ideology: 1.5 },
		{ name: "Alternative Liste", abbr: "AL", color: "#FF4500", ideology: 1.5 },
		{ name: "Piratenpartei", abbr: "PP", color: "#6A0DAD", ideology: 3.5 },
		{ name: "Aufrecht Schweiz", abbr: "AufS", color: "#8B4513", ideology: 8.0 },
		{ name: "Liberale Partei", abbr: "LP", color: "#4169E1", ideology: 6.5 },
		{ name: "Christlich-soziale Partei", abbr: "CSP", color: "#CD853F", ideology: 4.0 },
	];

	const minorParties: PartyActor[] = minorPartyNames.map((p) => ({
		id: generateId(),
		slug: slugify(p.abbr),
		name: p.name,
		actor_type: "party" as const,
		abbreviation: p.abbr,
		color: p.color,
		seats_nr: faker.number.int({ min: 0, max: 1 }),
		seats_sr: 0,
		ideology_position: p.ideology,
		founded: faker.number.int({ min: 1900, max: 2020 }),
		website: null,
		created_at: now(),
		updated_at: now(),
	}));

	// Fill remaining minor parties
	for (let i = 0; i < 33; i++) {
		minorParties.push({
			id: generateId(),
			slug: slugify(`partei-${i + 1}`),
			name: `${faker.word.adjective()} Partei ${faker.location.city()}`,
			actor_type: "party" as const,
			abbreviation: faker.string.alpha({ length: { min: 2, max: 4 }, casing: "upper" }),
			color: faker.color.rgb(),
			seats_nr: 0,
			seats_sr: 0,
			ideology_position: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
			founded: faker.number.int({ min: 1970, max: 2024 }),
			website: null,
			created_at: now(),
			updated_at: now(),
		});
	}

	return [...majorParties, ...minorParties];
}

// ---- Generate Politicians ----

function generatePoliticians(parties: PartyActor[]): PersonActor[] {
	const persons: PersonActor[] = [];
	const usedSlugs = new Set<string>();

	function addPerson(partySlug: string, council: "NR" | "SR", canton: string): void {
		const lang = cantonLanguage(canton);
		const gender: Gender = faker.helpers.arrayElement(["male", "female"]);
		const { firstName, lastName } = generateSwissName(lang, gender);
		let slug = slugify(`${firstName}-${lastName}`);
		while (usedSlugs.has(slug)) {
			slug = `${slug}-${faker.number.int({ min: 2, max: 99 })}`;
		}
		usedSlugs.add(slug);

		const numCommissions = faker.number.int({ min: 1, max: 3 });
		const commissions = faker.helpers
			.shuffle([...COMMISSIONS])
			.slice(0, numCommissions)
			.map((c) => c.code);

		persons.push({
			id: generateId(),
			slug,
			name: `${firstName} ${lastName}`,
			actor_type: "person",
			first_name: firstName,
			last_name: lastName,
			party_slug: partySlug,
			canton,
			council,
			commissions,
			portrait_url: null,
			election_date: faker.helpers.arrayElement(["2023-10-22", "2019-10-20", "2015-10-18"]),
			birth_year:
				faker.helpers.maybe(() => faker.number.int({ min: 1955, max: 1995 }), {
					probability: 0.85,
				}) ?? null,
			gender: faker.helpers.maybe(() => gender, { probability: 0.9 }) ?? null,
			language: lang,
			created_at: now(),
			updated_at: now(),
		});
	}

	// NR: distribute by party, then assign cantons proportionally
	const cantonPool: string[] = [];
	for (const [canton, seats] of Object.entries(NR_SEATS_PER_CANTON)) {
		for (let i = 0; i < seats; i++) {
			cantonPool.push(canton);
		}
	}
	const shuffledCantons = faker.helpers.shuffle(cantonPool);
	let cantonIdx = 0;

	for (const [partySlug, seats] of Object.entries(NR_PARTY_SEATS)) {
		if (partySlug === "other") {
			// Assign 'other' seats to minor parties
			for (let i = 0; i < seats; i++) {
				const minorParty = faker.helpers.arrayElement(
					parties.filter(
						(p) => !PARTIES.some((mp) => mp.slug === p.slug) && p.slug !== slugify(`partei-${i}`),
					),
				);
				addPerson(minorParty.slug, "NR", shuffledCantons[cantonIdx++]);
			}
		} else {
			for (let i = 0; i < seats; i++) {
				addPerson(partySlug, "NR", shuffledCantons[cantonIdx++]);
			}
		}
	}

	// SR: 46 seats distributed by canton
	const srCantonPool: string[] = [];
	for (const [canton, seats] of Object.entries(SR_SEATS_PER_CANTON)) {
		for (let i = 0; i < seats; i++) {
			srCantonPool.push(canton);
		}
	}

	// Distribute SR seats across major parties roughly proportionally
	const srPartyWeights = [
		{ slug: "mitte", weight: 14 },
		{ slug: "fdp", weight: 9 },
		{ slug: "sp", weight: 9 },
		{ slug: "svp", weight: 7 },
		{ slug: "gruene", weight: 5 },
		{ slug: "glp", weight: 2 },
	];

	let srIdx = 0;
	for (const { slug, weight } of srPartyWeights) {
		for (let i = 0; i < weight; i++) {
			if (srIdx < srCantonPool.length) {
				addPerson(slug, "SR", srCantonPool[srIdx++]);
			}
		}
	}

	return persons;
}

// ---- Generate Organizations ----

function generateOrganizations(): OrganizationActor[] {
	const orgs: OrganizationActor[] = [];
	const usedSlugs = new Set<string>();

	// Named Swiss org templates by industry for realism
	const orgTemplates: Record<string, string[]> = {
		banking: [
			"Schweizerische Bankgesellschaft",
			"Kantonalbank",
			"Privatbank Zurich",
			"Helvetia Finanz",
			"Alpina Vermogensverwaltung",
		],
		insurance: ["Schweizer Ruckversicherung", "Zurich Versicherung", "Alpenland Versicherung"],
		pharma: ["Biopharma Helvetia", "Swiss Medica", "Pharma Suisse", "Gentech Basel"],
		energy: ["Alpenergie", "Swiss Grid Solutions", "Wasserkraft Schweiz", "Solartech"],
		agriculture: ["Schweizer Bauernverband", "Agri Suisse", "BioSuisse Verband"],
		technology: ["Swiss Tech Innovation", "Digital Helvetia", "CyberSecure Schweiz"],
		defense: ["Swiss Defense Solutions", "Sicherheitstechnik"],
		consulting: ["Helvetia Consulting", "Swiss Advisory", "Zurich Strategy"],
		ngo: ["Transparency Schweiz", "Helvetas", "Pro Natura Suisse"],
		trade_association: ["Economiesuisse", "Schweizerischer Gewerbeverband", "Swissmem"],
	};

	const hqCities = [
		"Zurich",
		"Bern",
		"Basel",
		"Genf",
		"Lausanne",
		"Lugano",
		"Winterthur",
		"St. Gallen",
		"Luzern",
		"Zug",
		"Aarau",
		"Fribourg",
		"Solothurn",
		"Schaffhausen",
	];

	// Generate orgs per industry
	for (const industry of INDUSTRIES) {
		const templates = orgTemplates[industry] ?? [];
		const orgCount =
			industry === "banking" || industry === "pharma" || industry === "insurance"
				? faker.number.int({ min: 25, max: 35 })
				: faker.number.int({ min: 15, max: 25 });

		for (let i = 0; i < orgCount; i++) {
			const legalForm: LegalForm = faker.helpers.weightedArrayElement([
				{ value: "AG", weight: 50 },
				{ value: "GmbH", weight: 20 },
				{ value: "Verein", weight: 15 },
				{ value: "Stiftung", weight: 10 },
				{ value: "Genossenschaft", weight: 5 },
			]);

			let name: string;
			if (i < templates.length) {
				name = templates[i];
			} else {
				const suffix =
					legalForm === "AG"
						? "AG"
						: legalForm === "GmbH"
							? "GmbH"
							: legalForm === "Verein"
								? ""
								: legalForm === "Stiftung"
									? "Stiftung"
									: "Genossenschaft";
				name = `${faker.company.name()} ${suffix}`.trim();
			}

			let slug = slugify(name);
			while (usedSlugs.has(slug)) {
				slug = `${slug}-${faker.number.int({ min: 2, max: 99 })}`;
			}
			usedSlugs.add(slug);

			const hasUid = legalForm === "AG" || legalForm === "GmbH";

			orgs.push({
				id: generateId(),
				slug,
				name,
				actor_type: "organization",
				industry,
				legal_form: legalForm,
				uid: hasUid
					? `CHE-${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({ min: 100, max: 999 })}`
					: null,
				headquarters: faker.helpers.arrayElement(hqCities),
				website:
					faker.helpers.maybe(() => `https://www.${slug.slice(0, 20)}.ch`, { probability: 0.7 }) ??
					null,
				founding_year:
					faker.helpers.maybe(() => faker.number.int({ min: 1850, max: 2023 }), {
						probability: 0.8,
					}) ?? null,
				created_at: now(),
				updated_at: now(),
			});
		}
	}

	return orgs;
}

// ---- Generate Data Sources ----

function generateDataSources(): DataSource[] {
	return DATA_SOURCES.map((ds) => ({
		...ds,
		last_synced:
			ds.id === "media"
				? "2026-01-15T08:30:00Z"
				: `2026-02-${faker.number.int({ min: 20, max: 27 })}T${faker.number.int({ min: 0, max: 23 }).toString().padStart(2, "0")}:00:00Z`,
	}));
}

// ---- Generate Connections ----

function generateConnections(persons: PersonActor[], orgs: OrganizationActor[]): Connection[] {
	const connections: Connection[] = [];
	const usedPairs = new Set<string>();

	const rolesByType: Record<ConnectionType, string[]> = {
		mandate: ["Verwaltungsratsprasident", "Verwaltungsratsmitglied", "Vize-Prasident VR"],
		board_member: ["Prasident", "Vize-Prasident", "Vorstandsmitglied", "Kassier"],
		advisory: ["Beiratsmitglied", "Strategischer Berater", "Fachexperte"],
		foundation: ["Stiftungsratsprasident", "Stiftungsratsmitglied"],
		membership: ["Mitglied", "Ehrenmitglied", "Aktivmitglied"],
		lobbying: ["Zutrittsberechtigung Bundeshaus", "Mandatstrager"],
		donation: ["Spender", "Geldgeber"],
	};

	// Power-law: some orgs should be highly connected
	const highConnOrgs = orgs
		.filter(
			(o) =>
				o.industry === "banking" ||
				o.industry === "pharma" ||
				o.industry === "insurance" ||
				o.industry === "trade_association",
		)
		.slice(0, 30);

	// Each politician gets 2-15 connections
	for (const person of persons) {
		const numConns = faker.number.int({ min: 2, max: 15 });
		for (let i = 0; i < numConns; i++) {
			// 40% chance of connecting to high-connectivity orgs
			const org =
				faker.number.float({ min: 0, max: 1 }) < 0.4
					? faker.helpers.arrayElement(highConnOrgs)
					: faker.helpers.arrayElement(orgs);

			const pairKey = `${person.id}-${org.id}`;
			if (usedPairs.has(pairKey)) continue;
			usedPairs.add(pairKey);

			const connType = faker.helpers.weightedArrayElement([
				{ value: "mandate" as ConnectionType, weight: 25 },
				{ value: "board_member" as ConnectionType, weight: 20 },
				{ value: "advisory" as ConnectionType, weight: 15 },
				{ value: "foundation" as ConnectionType, weight: 10 },
				{ value: "membership" as ConnectionType, weight: 15 },
				{ value: "lobbying" as ConnectionType, weight: 10 },
				{ value: "donation" as ConnectionType, weight: 5 },
			]);

			const confidence = faker.helpers.weightedArrayElement([
				{ value: "verified" as ConfidenceLevel, weight: 60 },
				{ value: "declared" as ConfidenceLevel, weight: 25 },
				{ value: "reported" as ConfidenceLevel, weight: 10 },
				{ value: "inferred" as ConfidenceLevel, weight: 5 },
			]);

			const compensation = faker.helpers.weightedArrayElement([
				{ value: "paid" as CompensationStatus, weight: 40 },
				{ value: "unpaid" as CompensationStatus, weight: 35 },
				{ value: "unknown" as CompensationStatus, weight: 25 },
			]);

			// Source: verified/declared come from official sources, reported from media
			const sourceId =
				confidence === "reported" || confidence === "inferred"
					? "media"
					: faker.helpers.arrayElement(["parlament-ch", "zefix", "lobbywatch"]);

			connections.push({
				id: generateId(),
				source_actor_id: person.id,
				target_actor_id: org.id,
				connection_type: connType,
				confidence,
				data_source_id: sourceId,
				role: faker.helpers.arrayElement(rolesByType[connType]),
				compensation_status: compensation,
				valid_from: faker.date
					.between({ from: "2015-01-01", to: "2024-01-01" })
					.toISOString()
					.split("T")[0],
				valid_until: null,
				metadata: {},
				created_at: now(),
			});
		}
	}

	return connections;
}

// ---- Generate Votes ----

function generateVotes(): Vote[] {
	const voteTopics: Array<{ title: string; topic: TopicCategory; session: string }> = [
		{ title: "CO2-Gesetz Revision", topic: "environment", session: "2025-Herbstsession" },
		{
			title: "Krankenkassenpramien-Initiative",
			topic: "healthcare",
			session: "2025-Sommersession",
		},
		{ title: "Unternehmenssteuerreform IV", topic: "finance", session: "2025-Fruhjahrssession" },
		{ title: "Asylgesetz-Anderung", topic: "immigration", session: "2025-Herbstsession" },
		{ title: "Armee-Budgeterhohung 2026", topic: "defense", session: "2025-Wintersession" },
		{
			title: "Bildungsoffensive Digitalisierung",
			topic: "education",
			session: "2025-Sommersession",
		},
		{ title: "AHV-Reform 2025", topic: "social", session: "2025-Fruhjahrssession" },
		{ title: "Ausbau Bahninfrastruktur", topic: "infrastructure", session: "2025-Herbstsession" },
		{ title: "Agrarpolitik 2030", topic: "agriculture", session: "2025-Sommersession" },
		{ title: "EU-Rahmenabkommen", topic: "foreign_policy", session: "2025-Wintersession" },
		{ title: "Pestizid-Initiative", topic: "environment", session: "2024-Herbstsession" },
		{ title: "Pramienverbaindigung", topic: "healthcare", session: "2024-Sommersession" },
		{ title: "Verrechnungssteuer-Reform", topic: "finance", session: "2024-Fruhjahrssession" },
		{ title: "Integration-Gesetz", topic: "immigration", session: "2024-Herbstsession" },
		{ title: "Cybersicherheits-Gesetz", topic: "defense", session: "2024-Wintersession" },
		{ title: "Forschungsfreiheit-Initiative", topic: "education", session: "2024-Sommersession" },
		{ title: "BVG-Reform", topic: "social", session: "2024-Fruhjahrssession" },
		{ title: "Nationalstrassen-Ausbau", topic: "infrastructure", session: "2024-Herbstsession" },
		{ title: "Trinkwasser-Initiative", topic: "environment", session: "2024-Sommersession" },
		{ title: "Neutralitatsinitiative", topic: "foreign_policy", session: "2024-Wintersession" },
	];

	return voteTopics.map((v) => ({
		id: generateId(),
		title: v.title,
		date: faker.date.between({ from: "2024-01-01", to: "2025-12-31" }).toISOString().split("T")[0],
		session: v.session,
		description: `Abstimmung uber ${v.title} im National- und Standerat.`,
		topic_category: v.topic,
	}));
}

function generateVoteRecords(votes: Vote[], persons: PersonActor[]): VoteRecord[] {
	const records: VoteRecord[] = [];

	// Party voting tendencies (left-right axis affects topic positions)
	const partyTendencies: Record<string, Record<TopicCategory, number>> = {
		svp: {
			environment: 0.15,
			healthcare: 0.4,
			finance: 0.8,
			immigration: 0.1,
			defense: 0.9,
			education: 0.4,
			social: 0.3,
			infrastructure: 0.7,
			agriculture: 0.8,
			foreign_policy: 0.15,
		},
		sp: {
			environment: 0.9,
			healthcare: 0.85,
			finance: 0.2,
			immigration: 0.85,
			defense: 0.15,
			education: 0.9,
			social: 0.9,
			infrastructure: 0.6,
			agriculture: 0.5,
			foreign_policy: 0.8,
		},
		fdp: {
			environment: 0.3,
			healthcare: 0.35,
			finance: 0.85,
			immigration: 0.3,
			defense: 0.8,
			education: 0.6,
			social: 0.3,
			infrastructure: 0.7,
			agriculture: 0.4,
			foreign_policy: 0.5,
		},
		mitte: {
			environment: 0.5,
			healthcare: 0.6,
			finance: 0.5,
			immigration: 0.4,
			defense: 0.6,
			education: 0.7,
			social: 0.6,
			infrastructure: 0.65,
			agriculture: 0.65,
			foreign_policy: 0.55,
		},
		gruene: {
			environment: 0.95,
			healthcare: 0.85,
			finance: 0.15,
			immigration: 0.9,
			defense: 0.1,
			education: 0.85,
			social: 0.9,
			infrastructure: 0.4,
			agriculture: 0.7,
			foreign_policy: 0.85,
		},
		glp: {
			environment: 0.85,
			healthcare: 0.5,
			finance: 0.6,
			immigration: 0.6,
			defense: 0.4,
			education: 0.8,
			social: 0.5,
			infrastructure: 0.6,
			agriculture: 0.4,
			foreign_policy: 0.7,
		},
		evp: {
			environment: 0.7,
			healthcare: 0.6,
			finance: 0.4,
			immigration: 0.5,
			defense: 0.3,
			education: 0.7,
			social: 0.7,
			infrastructure: 0.5,
			agriculture: 0.5,
			foreign_policy: 0.5,
		},
	};

	const defaultTendency = 0.5;

	for (const vote of votes) {
		for (const person of persons) {
			// Get party voting tendency for this topic
			const tendency = partyTendencies[person.party_slug]?.[vote.topic_category] ?? defaultTendency;

			// ~80% party cohesion, 20% individual deviation
			const adjustedTendency = tendency + faker.number.float({ min: -0.2, max: 0.2 });
			const roll = faker.number.float({ min: 0, max: 1 });

			let position: "yes" | "no" | "abstain" | "absent";
			if (roll < 0.05) {
				position = "absent";
			} else if (roll < 0.08) {
				position = "abstain";
			} else if (roll < adjustedTendency) {
				position = "yes";
			} else {
				position = "no";
			}

			records.push({
				vote_id: vote.id,
				actor_id: person.id,
				position,
			});
		}
	}

	return records;
}

// ---- Main ----

function main() {
	console.log("Generating mock data for Seilschaften.ch...\n");

	mkdirSync(OUTPUT_DIR, { recursive: true });

	const parties = generateParties();
	console.log(`  Parties: ${parties.length}`);

	const persons = generatePoliticians(parties);
	console.log(
		`  Politicians: ${persons.length} (NR: ${persons.filter((p) => p.council === "NR").length}, SR: ${persons.filter((p) => p.council === "SR").length})`,
	);

	const orgs = generateOrganizations();
	console.log(`  Organizations: ${orgs.length}`);

	const dataSources = generateDataSources();
	console.log(`  Data Sources: ${dataSources.length}`);

	const connections = generateConnections(persons, orgs);
	console.log(`  Connections: ${connections.length}`);

	const votes = generateVotes();
	console.log(`  Votes: ${votes.length}`);

	const voteRecords = generateVoteRecords(votes, persons);
	console.log(`  Vote Records: ${voteRecords.length}`);

	// Write data files
	const writeData = (filename: string, varName: string, typeName: string, data: unknown) => {
		const content = `// Auto-generated by seed.ts — do not edit manually
import type { ${typeName} } from "@/types";

export const ${varName}: ${typeName}[] = ${JSON.stringify(data, null, "\t")};
`;
		writeFileSync(join(OUTPUT_DIR, filename), content);
		console.log(`  Written: ${filename}`);
	};

	writeData("actors-persons.ts", "persons", "PersonActor", persons);
	writeData("actors-organizations.ts", "organizations", "OrganizationActor", orgs);
	writeData("actors-parties.ts", "parties", "PartyActor", parties);
	writeData("connections.ts", "connections", "Connection", connections);
	writeData("sources.ts", "dataSources", "DataSource", dataSources);
	writeData("votes.ts", "votes", "Vote", votes);

	// Vote records is a special case (uses VoteRecord type)
	const voteRecordsContent = `// Auto-generated by seed.ts — do not edit manually
import type { VoteRecord } from "@/types";

export const voteRecords: VoteRecord[] = ${JSON.stringify(voteRecords, null, "\t")};
`;
	writeFileSync(join(OUTPUT_DIR, "vote-records.ts"), voteRecordsContent);
	console.log("  Written: vote-records.ts");

	// Write barrel export
	const indexContent = `// Auto-generated by seed.ts — do not edit manually
export { persons } from "./actors-persons";
export { organizations } from "./actors-organizations";
export { parties } from "./actors-parties";
export { connections } from "./connections";
export { dataSources } from "./sources";
export { votes } from "./votes";
export { voteRecords } from "./vote-records";
`;
	writeFileSync(join(OUTPUT_DIR, "index.ts"), indexContent);
	console.log("  Written: index.ts");

	console.log("\nMock data generation complete!");
}

main();
