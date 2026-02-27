/**
 * Seed script for local Supabase development.
 * Run with: npx tsx supabase/seed.ts
 *
 * Generates:
 * - 5 data sources
 * - 7 major parties + 1 minor
 * - 246 politicians (200 NR + 46 SR)
 * - ~500 organizations
 * - ~22 commissions (modeled as organization actors)
 * - ~3000-5000 connections (including ~400 commission memberships)
 * - ~50 votes with records
 */

import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker/locale/de_CH";
import type { Database } from "../src/types/database";

// Use local Supabase with service role key to bypass RLS
const supabase = createClient<Database>(
	"http://127.0.0.1:54331",
	// Local dev service role key (safe to hardcode for local dev only)
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
);

// ── Helpers ──────────────────────────────────────────────────

function pickRandom<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
	const total = weights.reduce((a, b) => a + b, 0);
	let r = Math.random() * total;
	for (let i = 0; i < items.length; i++) {
		r -= weights[i];
		if (r <= 0) return items[i];
	}
	return items[items.length - 1];
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[äà]/g, "a")
		.replace(/[öò]/g, "o")
		.replace(/[üù]/g, "u")
		.replace(/[éèê]/g, "e")
		.replace(/[ç]/g, "c")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function swissUid(): string {
	const n1 = faker.number.int({ min: 100, max: 999 });
	const n2 = faker.number.int({ min: 100, max: 999 });
	const n3 = faker.number.int({ min: 100, max: 999 });
	return `CHE-${n1}.${n2}.${n3}`;
}

// ── Constants ────────────────────────────────────────────────

const FRENCH_CANTONS = ["VD", "GE", "NE", "JU"];
const ITALIAN_CANTONS = ["TI"];
const BILINGUAL_FR = ["FR", "VS"];

const CANTONS_ALL = [
	"ZH", "BE", "LU", "UR", "SZ", "OW", "NW", "GL", "ZG", "FR",
	"SO", "BS", "BL", "SH", "AR", "AI", "SG", "GR", "AG", "TG",
	"TI", "VD", "VS", "NE", "GE", "JU",
];

const NR_SEATS: Record<string, number> = {
	ZH: 36, BE: 24, VD: 19, AG: 16, SG: 12, GE: 12, LU: 10, TI: 8,
	VS: 8, FR: 7, BL: 7, SO: 6, TG: 6, BS: 5, GR: 5, NE: 4, SZ: 4,
	ZG: 3, SH: 2, JU: 2, AR: 1, AI: 1, GL: 1, NW: 1, OW: 1, UR: 1,
};

const SR_SEATS: Record<string, number> = {
	ZH: 2, BE: 2, LU: 2, UR: 2, SZ: 2, OW: 1, NW: 1, GL: 2, ZG: 2,
	FR: 2, SO: 2, BS: 1, BL: 1, SH: 2, AR: 1, AI: 1, SG: 2, GR: 2,
	AG: 2, TG: 2, TI: 2, VD: 2, VS: 2, NE: 2, GE: 2, JU: 2,
};

const PARTY_DEFS = [
	{ slug: "svp", name: "Schweizerische Volkspartei", name_fr: "Union democratique du centre", name_it: "Unione Democratica di Centro", abbreviation: "SVP", color: "#4B8B3B", seats_nr: 62, seats_sr: 7, ideology_position: 8.5, founded: 1971 },
	{ slug: "sp", name: "Sozialdemokratische Partei", name_fr: "Parti socialiste", name_it: "Partito socialista", abbreviation: "SP", color: "#E30613", seats_nr: 41, seats_sr: 9, ideology_position: 2.5, founded: 1888 },
	{ slug: "fdp", name: "FDP.Die Liberalen", name_fr: "PLR.Les Liberaux-Radicaux", name_it: "PLR.I Liberali", abbreviation: "FDP", color: "#0064B4", seats_nr: 28, seats_sr: 9, ideology_position: 7.0, founded: 2009 },
	{ slug: "mitte", name: "Die Mitte", name_fr: "Le Centre", name_it: "Alleanza del Centro", abbreviation: "Mitte", color: "#F28C00", seats_nr: 29, seats_sr: 14, ideology_position: 5.5, founded: 2021 },
	{ slug: "gruene", name: "Grune Partei der Schweiz", name_fr: "Les Verts", name_it: "I Verdi", abbreviation: "Grune", color: "#84B414", seats_nr: 23, seats_sr: 5, ideology_position: 2.0, founded: 1983 },
	{ slug: "glp", name: "Grunliberale Partei", name_fr: "Vert'liberaux", name_it: "Verdi liberali", abbreviation: "GLP", color: "#C8D82E", seats_nr: 10, seats_sr: 0, ideology_position: 4.5, founded: 2007 },
	{ slug: "evp", name: "Evangelische Volkspartei", name_fr: "Parti evangelique", name_it: "Partito evangelico", abbreviation: "EVP", color: "#FFCC00", seats_nr: 2, seats_sr: 0, ideology_position: 4.0, founded: 1919 },
	{ slug: "edu", name: "Eidgenossisch-Demokratische Union", name_fr: "Union Democratique Federale", name_it: "Unione Democratica Federale", abbreviation: "EDU", color: "#8B4513", seats_nr: 1, seats_sr: 0, ideology_position: 9.0, founded: 1975 },
];

const INDUSTRIES = [
	"banking", "insurance", "pharma", "medtech", "energy", "agriculture",
	"technology", "defense", "consulting", "legal", "real_estate", "transport",
	"telecommunications", "media", "retail", "food", "tourism", "construction",
	"chemicals", "ngo", "education", "healthcare", "trade_association",
];

const LEGAL_FORMS = ["AG", "GmbH", "Verein", "Stiftung", "Genossenschaft"];

const ORG_NAME_PREFIXES_DE = [
	"Schweizerischer", "Schweizer", "Nationaler", "Zentraler", "Eidgenössischer",
];
const ORG_NAME_SUFFIXES_DE: Record<string, string[]> = {
	banking: ["Bankenverband", "Finanzgruppe", "Bankgesellschaft", "Kapitalgesellschaft"],
	insurance: ["Versicherungsverband", "Versicherungsgruppe", "Rückversicherung"],
	pharma: ["Pharma", "Therapeutics", "Biotech", "Life Sciences"],
	medtech: ["Medizintechnik", "Medical", "Health Solutions"],
	energy: ["Energiekonzern", "Energie", "Power", "Kraftwerke"],
	agriculture: ["Bauernverband", "Agrar", "Landwirtschaft"],
	technology: ["Technologies", "Digital", "Systems", "Software"],
	defense: ["Defense", "Sicherheitstechnik", "Security"],
	consulting: ["Consulting", "Beratung", "Advisory"],
	legal: ["Anwälte", "Kanzlei", "Rechtsberatung"],
	real_estate: ["Immobilien", "Real Estate", "Liegenschaften"],
	transport: ["Transport", "Logistik", "Mobilität"],
	telecommunications: ["Telecom", "Communications", "Netzwerke"],
	media: ["Medien", "Verlag", "Publishing"],
	retail: ["Handel", "Retail", "Detailhandel"],
	food: ["Lebensmittel", "Food", "Nahrungsmittel"],
	tourism: ["Tourismus", "Hotellerie", "Reisen"],
	construction: ["Bau", "Bauunternehmung", "Architektur"],
	chemicals: ["Chemie", "Chemical", "Werkstoffe"],
	ngo: ["Hilfswerk", "Stiftung", "Verein"],
	education: ["Bildung", "Akademie", "Institut"],
	healthcare: ["Gesundheit", "Klinik", "Spital"],
	trade_association: ["Branchenverband", "Gewerbeverband", "Wirtschaftsverband"],
};

const FR_FIRST_NAMES_M = ["Jean", "Pierre", "Marc", "Philippe", "Alain", "Laurent", "Christophe", "Nicolas", "François", "Thierry"];
const FR_FIRST_NAMES_F = ["Marie", "Catherine", "Isabelle", "Nathalie", "Sophie", "Valérie", "Monique", "Françoise", "Claire", "Anne"];
const FR_LAST_NAMES = ["Dupont", "Moreau", "Bernard", "Petit", "Robert", "Richard", "Durand", "Leroy", "Blanc", "Favre", "Martin", "Rochat", "Vuilleumier", "Berset", "Jaquet"];

const IT_FIRST_NAMES_M = ["Marco", "Andrea", "Luca", "Giovanni", "Paolo", "Alessandro", "Roberto", "Carlo", "Fabio", "Matteo"];
const IT_FIRST_NAMES_F = ["Maria", "Anna", "Laura", "Giulia", "Francesca", "Sara", "Elena", "Chiara", "Silvia", "Rosa"];
const IT_LAST_NAMES = ["Rossi", "Bianchi", "Ferrari", "Colombo", "Romano", "Ricci", "Fontana", "Lombardi", "Bernasconi", "Bentivoglio"];

const CONNECTION_TYPES = ["mandate", "membership", "lobbying", "donation", "employment"] as const;
const CONNECTION_WEIGHTS = [40, 25, 15, 10, 10];
const CONFIDENCE_LEVELS = ["verified", "declared", "media_reported", "inferred"] as const;
const CONFIDENCE_WEIGHTS = [20, 60, 15, 5];

const ROLES_BY_TYPE: Record<string, string[]> = {
	mandate: ["Verwaltungsrat", "Verwaltungsratspräsident", "Stiftungsrat", "Stiftungsratspräsident", "Beirat"],
	membership: ["Mitglied", "Vorstandsmitglied", "Präsident", "Vizeprasident", "Kassier"],
	lobbying: ["Lobbyist", "Public Affairs Berater", "Interessenvertreter", "Zugangsberechtigter"],
	donation: ["Spender", "Förderer", "Gönner"],
	employment: ["Geschäftsführer", "Partner", "Senior Berater", "Direktor", "Angestellter"],
};

const VOTE_TOPICS = [
	{ category: "finance", titles: ["Bundesgesetz über die Verrechnungssteuer", "Änderung des Bankengesetzes", "Stabilisierung der AHV-Finanzen", "Revision des Steuerstrafrechts"] },
	{ category: "healthcare", titles: ["Änderung des Krankenversicherungsgesetzes", "Bundesgesetz über die Medizinalberufe", "Kostenbremse-Initiative", "Pflegeinitiative Umsetzung"] },
	{ category: "environment", titles: ["CO2-Gesetz Revision", "Gegenvorschlag zur Gletscherinitiative", "Gewässerschutzgesetz Änderung", "Biodiversitätsinitiative"] },
	{ category: "immigration", titles: ["Revision Asylgesetz", "Änderung Ausländergesetz", "Schengen-Weiterentwicklung", "Integrationsgesetz"] },
	{ category: "defense", titles: ["Armeebotschaft", "Beschaffung Kampfflugzeuge", "Revision Militärgesetz", "Nachrichtendienstgesetz"] },
	{ category: "agriculture", titles: ["Agrarpolitik AP22+", "Direktzahlungsverordnung", "Revision Lebensmittelgesetz", "Pflanzenschutzmittel-Regulierung"] },
	{ category: "economy", titles: ["Mindestlohn-Initiative", "Revision Arbeitsgesetz", "Unternehmenssteuerreform", "Kartellgesetz Revision"] },
	{ category: "digital", titles: ["Bundesgesetz über elektronische Identifizierung", "Datenschutzgesetz Revision", "Digitalisierungsstrategie", "Plattformregulierung"] },
];

// Parliamentary commissions (NR = Nationalrat, SR = Standerat)
const COMMISSION_DEFS = [
	{ code: "APK", name: "Aussenpolitische Kommission", name_fr: "Commission de politique exterieure", name_it: "Commissione della politica estera" },
	{ code: "FK", name: "Finanzkommission", name_fr: "Commission des finances", name_it: "Commissione delle finanze" },
	{ code: "GPK", name: "Geschäftsprüfungskommission", name_fr: "Commission de gestion", name_it: "Commissione della gestione" },
	{ code: "KVF", name: "Kommission für Verkehr und Fernmeldewesen", name_fr: "Commission des transports et des telecommunications", name_it: "Commissione dei trasporti e delle telecomunicazioni" },
	{ code: "RK", name: "Kommission für Rechtsfragen", name_fr: "Commission des affaires juridiques", name_it: "Commissione degli affari giuridici" },
	{ code: "SGK", name: "Kommission für soziale Sicherheit und Gesundheit", name_fr: "Commission de la securite sociale et de la sante publique", name_it: "Commissione della sicurezza sociale e della sanita" },
	{ code: "SiK", name: "Sicherheitspolitische Kommission", name_fr: "Commission de la politique de securite", name_it: "Commissione della politica di sicurezza" },
	{ code: "SPK", name: "Staatspolitische Kommission", name_fr: "Commission des institutions politiques", name_it: "Commissione delle istituzioni politiche" },
	{ code: "UREK", name: "Kommission für Umwelt, Raumplanung und Energie", name_fr: "Commission de l'environnement, de l'amenagement du territoire et de l'energie", name_it: "Commissione dell'ambiente, della pianificazione del territorio e dell'energia" },
	{ code: "WAK", name: "Kommission für Wirtschaft und Abgaben", name_fr: "Commission de l'economie et des redevances", name_it: "Commissione dell'economia e dei tributi" },
	{ code: "WBK", name: "Kommission für Wissenschaft, Bildung und Kultur", name_fr: "Commission de la science, de l'education et de la culture", name_it: "Commissione della scienza, dell'educazione e della cultura" },
];

// ── Main seed function ───────────────────────────────────────

async function seed() {
	console.log("Clearing existing data...");
	// Delete in dependency order
	await supabase.from("vote_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
	await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
	await supabase.from("connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
	await supabase.from("actors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
	await supabase.from("data_sources").delete().neq("id", "placeholder");

	// ── 1. Data Sources ──────────────────────────────────────

	console.log("Seeding data sources...");
	const dataSources = [
		{ id: "parlament-ch", name: "parlament_ch", display_name: "parlament.ch", base_url: "https://www.parlament.ch", description: "Offizielle Daten des Schweizer Parlaments - Ratsmitglieder und Interessenbindungen", record_count: 0, sync_frequency_hours: 24, last_synced_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
		{ id: "zefix", name: "zefix", display_name: "Zefix / Handelsregister", base_url: "https://www.zefix.admin.ch", description: "Schweizerisches Handelsamtsblatt - Verwaltungsratsmandate und Unternehmensstrukturen", record_count: 0, sync_frequency_hours: 168, last_synced_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
		{ id: "lobbywatch", name: "lobbywatch", display_name: "Lobbywatch.ch", base_url: "https://lobbywatch.ch", description: "NGO-Daten über Lobbyismus im Bundeshaus", record_count: 0, sync_frequency_hours: 72, last_synced_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
		{ id: "lobbyregister", name: "lobbyregister", display_name: "Lobbyregister", base_url: "https://www.parlament.ch/de/services/lobbyregister", description: "Offizielles Lobbyregister des Parlaments", record_count: 0, sync_frequency_hours: 48, last_synced_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
		{ id: "eidg-kanzlei", name: "eidg_kanzlei", display_name: "Eidgenössische Bundeskanzlei", base_url: "https://www.bk.admin.ch", description: "Transparenz politischer Finanzierung und Abstimmungskomitees", record_count: 0, sync_frequency_hours: 720, last_synced_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
	];

	const { error: dsError } = await supabase.from("data_sources").insert(dataSources);
	if (dsError) throw new Error(`Data sources insert failed: ${dsError.message}`);
	console.log(`  Inserted ${dataSources.length} data sources`);

	// ── 2. Parties ───────────────────────────────────────────

	console.log("Seeding parties...");
	const partyInserts = PARTY_DEFS.map((p) => ({
		slug: p.slug,
		actor_type: "party" as const,
		name: p.name,
		name_fr: p.name_fr,
		name_it: p.name_it,
		abbreviation: p.abbreviation,
		color: p.color,
		seats_nr: p.seats_nr,
		seats_sr: p.seats_sr,
		ideology_position: p.ideology_position,
		founded: p.founded,
		website: `https://${p.slug}.ch`,
		metadata: {},
	}));

	const { data: parties, error: partyError } = await supabase
		.from("actors")
		.insert(partyInserts)
		.select("id, slug");
	if (partyError) throw new Error(`Party insert failed: ${partyError.message}`);
	console.log(`  Inserted ${parties.length} parties`);

	const partyMap = new Map(parties.map((p) => [p.slug, p.id]));

	// ── 3. Politicians ───────────────────────────────────────

	console.log("Seeding politicians...");

	// Build seat assignments per canton and party
	type SeatAssignment = { canton: string; council: "NR" | "SR"; partySlug: string };
	const seatAssignments: SeatAssignment[] = [];

	// NR seats by canton
	for (const [canton, seats] of Object.entries(NR_SEATS)) {
		for (let i = 0; i < seats; i++) {
			// Distribute proportionally to parties
			const partySlug = weightedPick(
				PARTY_DEFS.map((p) => p.slug),
				PARTY_DEFS.map((p) => p.seats_nr),
			);
			seatAssignments.push({ canton, council: "NR", partySlug });
		}
	}

	// SR seats by canton
	for (const [canton, seats] of Object.entries(SR_SEATS)) {
		for (let i = 0; i < seats; i++) {
			const partySlug = weightedPick(
				PARTY_DEFS.map((p) => p.slug),
				PARTY_DEFS.map((p) => Math.max(p.seats_sr, 1)),
			);
			seatAssignments.push({ canton, council: "SR", partySlug });
		}
	}

	const usedSlugs = new Set<string>();
	const politicianInserts = seatAssignments.map((seat) => {
		const isFrench = FRENCH_CANTONS.includes(seat.canton) || (BILINGUAL_FR.includes(seat.canton) && Math.random() < 0.4);
		const isItalian = ITALIAN_CANTONS.includes(seat.canton) || (seat.canton === "GR" && Math.random() < 0.15);
		const isFemale = Math.random() < 0.42;

		let firstName: string;
		let lastName: string;

		if (isItalian) {
			firstName = isFemale ? pickRandom(IT_FIRST_NAMES_F) : pickRandom(IT_FIRST_NAMES_M);
			lastName = pickRandom(IT_LAST_NAMES);
		} else if (isFrench) {
			firstName = isFemale ? pickRandom(FR_FIRST_NAMES_F) : pickRandom(FR_FIRST_NAMES_M);
			lastName = pickRandom(FR_LAST_NAMES);
		} else {
			firstName = isFemale ? faker.person.firstName("female") : faker.person.firstName("male");
			lastName = faker.person.lastName();
		}

		let baseSlug = slugify(`${firstName}-${lastName}`);
		while (usedSlugs.has(baseSlug)) {
			baseSlug = `${baseSlug}-${faker.number.int({ min: 2, max: 99 })}`;
		}
		usedSlugs.add(baseSlug);

		const language = isItalian ? "it" : isFrench ? "fr" : "de";
		const hasPortrait = Math.random() > 0.1;
		const hasDob = Math.random() > 0.08;

		return {
			slug: baseSlug,
			actor_type: "person" as const,
			name: `${lastName}, ${firstName}`,
			first_name: firstName,
			last_name: lastName,
			party_id: partyMap.get(seat.partySlug) ?? null,
			canton: seat.canton,
			council: seat.council,
			portrait_url: hasPortrait ? `https://api.dicebear.com/7.x/personas/svg?seed=${baseSlug}` : null,
			date_of_birth: hasDob ? faker.date.birthdate({ min: 30, max: 72, mode: "age" }).toISOString().split("T")[0] : null,
			gender: isFemale ? "F" : "M",
			language,
			metadata: {},
		};
	});

	// Insert in batches of 100
	const politicianIds: string[] = [];
	for (let i = 0; i < politicianInserts.length; i += 100) {
		const batch = politicianInserts.slice(i, i + 100);
		const { data, error } = await supabase.from("actors").insert(batch).select("id");
		if (error) throw new Error(`Politician insert batch ${i} failed: ${error.message}`);
		politicianIds.push(...data.map((d) => d.id));
	}
	console.log(`  Inserted ${politicianIds.length} politicians`);

	// ── 4. Organizations ─────────────────────────────────────

	console.log("Seeding organizations...");

	const orgInserts: Array<{
		slug: string;
		actor_type: "organization";
		name: string;
		name_fr: string | null;
		name_it: string | null;
		industry: string;
		legal_form: string;
		uid: string;
		headquarters: string;
		website: string;
		metadata: Record<string, never>;
	}> = [];

	for (let i = 0; i < 500; i++) {
		const industry = pickRandom(INDUSTRIES);
		const legalForm = pickRandom(LEGAL_FORMS);
		const suffixes = ORG_NAME_SUFFIXES_DE[industry] ?? ["AG"];
		const suffix = pickRandom(suffixes);

		let orgName: string;
		if (Math.random() < 0.3) {
			orgName = `${pickRandom(ORG_NAME_PREFIXES_DE)} ${suffix}`;
		} else {
			orgName = `${faker.company.name()} ${suffix}`;
		}

		// Ensure unique slug
		let orgSlug = slugify(orgName);
		while (usedSlugs.has(orgSlug)) {
			orgSlug = `${orgSlug}-${faker.number.int({ min: 2, max: 999 })}`;
		}
		usedSlugs.add(orgSlug);

		const hq = pickRandom(CANTONS_ALL);
		const hasFrName = Math.random() < 0.2;
		const hasItName = Math.random() < 0.05;

		orgInserts.push({
			slug: orgSlug,
			actor_type: "organization",
			name: orgName,
			name_fr: hasFrName ? `${orgName} (FR)` : null,
			name_it: hasItName ? `${orgName} (IT)` : null,
			industry,
			legal_form: legalForm,
			uid: swissUid(),
			headquarters: hq,
			website: `https://${orgSlug.slice(0, 20)}.ch`,
			metadata: {},
		});
	}

	const orgIds: string[] = [];
	for (let i = 0; i < orgInserts.length; i += 100) {
		const batch = orgInserts.slice(i, i + 100);
		const { data, error } = await supabase.from("actors").insert(batch).select("id");
		if (error) throw new Error(`Org insert batch ${i} failed: ${error.message}`);
		orgIds.push(...data.map((d) => d.id));
	}
	console.log(`  Inserted ${orgIds.length} organizations`);

	// ── 4b. Commissions (modeled as organization actors) ─────

	console.log("Seeding commissions...");

	const commissionInserts: Array<{
		slug: string;
		actor_type: "organization";
		name: string;
		name_fr: string | null;
		name_it: string | null;
		abbreviation: string;
		industry: string;
		headquarters: string;
		website: string;
		metadata: Record<string, string>;
	}> = [];

	// Each commission exists in both NR and SR variants
	for (const comm of COMMISSION_DEFS) {
		for (const council of ["N", "S"] as const) {
			const abbrev = `${comm.code}-${council}`;
			const councilName = council === "N" ? "Nationalrat" : "Standerat";
			const fullName = `${comm.name} ${councilName}`;
			const slug = slugify(abbrev);
			usedSlugs.add(slug);

			commissionInserts.push({
				slug,
				actor_type: "organization",
				name: fullName,
				name_fr: comm.name_fr ? `${comm.name_fr} (${council === "N" ? "CN" : "CE"})` : null,
				name_it: comm.name_it ? `${comm.name_it} (${council === "N" ? "CN" : "CS"})` : null,
				abbreviation: abbrev,
				industry: "commission",
				headquarters: "BE",
				website: "https://www.parlament.ch",
				metadata: { org_type: "commission" },
			});
		}
	}

	const { data: commissions, error: commError } = await supabase
		.from("actors")
		.insert(commissionInserts)
		.select("id, abbreviation");
	if (commError) throw new Error(`Commission insert failed: ${commError.message}`);
	console.log(`  Inserted ${commissions.length} commissions`);

	const commissionMap = new Map(commissions.map((c) => [c.abbreviation, c.id]));

	// ── 4c. Commission membership connections ────────────────

	console.log("Seeding commission memberships...");

	type ConnectionInsertType = Database["public"]["Tables"]["connections"]["Insert"];
	const commConnectionInserts: ConnectionInsertType[] = [];
	const commConnectionKeys = new Set<string>();

	// NR commissions: assign NR politicians
	// SR commissions: assign SR politicians
	const nrCommCodes = COMMISSION_DEFS.map((c) => `${c.code}-N`);
	const srCommCodes = COMMISSION_DEFS.map((c) => `${c.code}-S`);

	// NR politicians (first 200) get ~1.6 commissions each on average
	for (const politicianId of politicianIds.slice(0, 200)) {
		const numCommissions = Math.random() < 0.6 ? 2 : 1;
		const assigned = new Set<string>();
		for (let i = 0; i < numCommissions; i++) {
			const commCode = pickRandom(nrCommCodes);
			if (assigned.has(commCode)) continue;
			assigned.add(commCode);

			const commId = commissionMap.get(commCode);
			if (!commId) continue;

			const key = `${politicianId}-${commId}-membership-parlament-ch-Mitglied`;
			if (commConnectionKeys.has(key)) continue;
			commConnectionKeys.add(key);

			// ~8% chance of being president
			const role = Math.random() < 0.08 ? "Präsident" : "Mitglied";

			commConnectionInserts.push({
				source_actor_id: politicianId,
				target_actor_id: commId,
				connection_type: "membership",
				role,
				confidence: "verified",
				data_source_id: "parlament-ch",
				source_url: "https://www.parlament.ch/de/organe/kommissionen",
				source_retrieved_at: new Date().toISOString(),
				valid_from: "2023-12-01",
				metadata: {},
			});
		}
	}

	// SR politicians (after 200) get ~1.6 commissions each
	for (const politicianId of politicianIds.slice(200)) {
		const numCommissions = Math.random() < 0.6 ? 2 : 1;
		const assigned = new Set<string>();
		for (let i = 0; i < numCommissions; i++) {
			const commCode = pickRandom(srCommCodes);
			if (assigned.has(commCode)) continue;
			assigned.add(commCode);

			const commId = commissionMap.get(commCode);
			if (!commId) continue;

			const key = `${politicianId}-${commId}-membership-parlament-ch-Mitglied`;
			if (commConnectionKeys.has(key)) continue;
			commConnectionKeys.add(key);

			const role = Math.random() < 0.08 ? "Präsident" : "Mitglied";

			commConnectionInserts.push({
				source_actor_id: politicianId,
				target_actor_id: commId,
				connection_type: "membership",
				role,
				confidence: "verified",
				data_source_id: "parlament-ch",
				source_url: "https://www.parlament.ch/de/organe/kommissionen",
				source_retrieved_at: new Date().toISOString(),
				valid_from: "2023-12-01",
				metadata: {},
			});
		}
	}

	// Insert commission memberships
	let commConnInserted = 0;
	for (let i = 0; i < commConnectionInserts.length; i += 200) {
		const batch = commConnectionInserts.slice(i, i + 200);
		const { error } = await supabase.from("connections").insert(batch);
		if (error) {
			console.log(`  Warning: commission batch ${i} had issues: ${error.message}`);
		} else {
			commConnInserted += batch.length;
		}
	}
	console.log(`  Inserted ${commConnInserted} commission memberships`);

	// ── 5. Connections ───────────────────────────────────────

	console.log("Seeding connections...");

	const connectionInserts: ConnectionInsertType[] = [];
	const connectionKeys = new Set<string>();

	const dataSourceIds = dataSources.map((ds) => ds.id);

	// Power-law: some orgs are "hubs" with many connections
	const hubOrgCount = Math.floor(orgIds.length * 0.1);
	const hubOrgIds = orgIds.slice(0, hubOrgCount);

	for (const politicianId of politicianIds) {
		// Each politician gets 3-12 connections
		const numConnections = faker.number.int({ min: 3, max: 12 });

		for (let c = 0; c < numConnections; c++) {
			// 60% chance to connect to a hub org (power-law)
			const targetOrgId = Math.random() < 0.6
				? pickRandom(hubOrgIds)
				: pickRandom(orgIds);

			const connType = weightedPick(CONNECTION_TYPES, CONNECTION_WEIGHTS);
			const confidence = weightedPick(CONFIDENCE_LEVELS, CONFIDENCE_WEIGHTS);
			const dsId = pickRandom(dataSourceIds);
			const role = pickRandom(ROLES_BY_TYPE[connType]);

			const key = `${politicianId}-${targetOrgId}-${connType}-${dsId}-${role}`;
			if (connectionKeys.has(key)) continue;
			connectionKeys.add(key);

			const isHistorical = Math.random() < 0.2;
			const validFrom = faker.date.between({ from: "2015-01-01", to: "2023-01-01" }).toISOString().split("T")[0];

			connectionInserts.push({
				source_actor_id: politicianId,
				target_actor_id: targetOrgId,
				connection_type: connType,
				role,
				is_paid: connType === "mandate" ? Math.random() < 0.7 : connType === "employment" ? true : null,
				confidence,
				data_source_id: dsId,
				source_url: `https://example.ch/source/${faker.string.alphanumeric(8)}`,
				source_retrieved_at: faker.date.recent({ days: 90 }).toISOString(),
				valid_from: validFrom,
				valid_until: isHistorical ? faker.date.between({ from: validFrom, to: "2025-12-31" }).toISOString().split("T")[0] : null,
				metadata: {},
			});
		}
	}

	// Insert connections in batches
	let connInserted = 0;
	for (let i = 0; i < connectionInserts.length; i += 200) {
		const batch = connectionInserts.slice(i, i + 200);
		const { error } = await supabase.from("connections").insert(batch);
		if (error) {
			// Some duplicates are expected with the UNIQUE constraint, skip those
			console.log(`  Warning: batch ${i} had issues: ${error.message}`);
		} else {
			connInserted += batch.length;
		}
	}
	console.log(`  Inserted ~${connInserted} connections`);

	// Update data source record counts
	for (const ds of dataSources) {
		const { count } = await supabase.from("connections").select("*", { count: "exact", head: true }).eq("data_source_id", ds.id);
		await supabase.from("data_sources").update({ record_count: count ?? 0 }).eq("id", ds.id);
	}

	// ── 6. Votes ─────────────────────────────────────────────

	console.log("Seeding votes...");

	type VoteInsert = Database["public"]["Tables"]["votes"]["Insert"];
	const voteInserts: VoteInsert[] = [];

	for (const topic of VOTE_TOPICS) {
		for (const title of topic.titles) {
			const council = pickRandom(["NR", "SR"] as const);
			voteInserts.push({
				affair_id: `${faker.number.int({ min: 20, max: 24 })}.${faker.number.int({ min: 1000, max: 9999 })}`,
				affair_title: title,
				affair_title_fr: `${title} (FR)`,
				vote_date: faker.date.between({ from: "2020-01-01", to: "2025-12-31" }).toISOString().split("T")[0],
				council,
				topic_category: topic.category,
				description: `Abstimmung über ${title}`,
			});
		}
	}

	const { data: votes, error: voteError } = await supabase
		.from("votes")
		.insert(voteInserts)
		.select("id, council");
	if (voteError) throw new Error(`Vote insert failed: ${voteError.message}`);
	console.log(`  Inserted ${votes.length} votes`);

	// ── 7. Vote Records ──────────────────────────────────────

	console.log("Seeding vote records...");

	// Group politicians by council from seat assignments
	const nrPoliticianIds = politicianIds.slice(0, 200);
	const srPoliticianIds = politicianIds.slice(200);

	// Get party mapping for cohesion simulation
	const { data: politiciansWithParty } = await supabase
		.from("actors")
		.select("id, party_id")
		.eq("actor_type", "person");
	const politicianPartyMap = new Map(
		(politiciansWithParty ?? []).map((p) => [p.id, p.party_id]),
	);

	type VoteRecordInsert = Database["public"]["Tables"]["vote_records"]["Insert"];
	const allVoteRecords: VoteRecordInsert[] = [];

	for (const vote of votes) {
		const voterIds = vote.council === "NR" ? nrPoliticianIds : srPoliticianIds;

		// Determine party-level position (random per party per vote)
		const partyPositions = new Map<string, "yes" | "no">();
		for (const p of PARTY_DEFS) {
			const partyId = partyMap.get(p.slug);
			if (partyId) {
				partyPositions.set(partyId, Math.random() < 0.5 ? "yes" : "no");
			}
		}

		for (const voterId of voterIds) {
			// 5% absent
			if (Math.random() < 0.05) {
				allVoteRecords.push({
					vote_id: vote.id,
					actor_id: voterId,
					decision: Math.random() < 0.7 ? "absent" : "not_participating",
				});
				continue;
			}

			// 80% party cohesion
			const partyId = politicianPartyMap.get(voterId);
			const partyPosition = partyId ? partyPositions.get(partyId) : null;

			let decision: "yes" | "no" | "abstain";
			if (partyPosition && Math.random() < 0.8) {
				decision = partyPosition;
			} else {
				const r = Math.random();
				if (r < 0.45) decision = "yes";
				else if (r < 0.9) decision = "no";
				else decision = "abstain";
			}

			allVoteRecords.push({
				vote_id: vote.id,
				actor_id: voterId,
				decision,
			});
		}
	}

	// Insert vote records in batches
	let vrInserted = 0;
	for (let i = 0; i < allVoteRecords.length; i += 500) {
		const batch = allVoteRecords.slice(i, i + 500);
		const { error } = await supabase.from("vote_records").insert(batch);
		if (error) throw new Error(`Vote records batch ${i} failed: ${error.message}`);
		vrInserted += batch.length;
	}
	console.log(`  Inserted ${vrInserted} vote records`);

	// ── Summary ──────────────────────────────────────────────

	console.log("\nSeed complete!");
	console.log(`  Data sources: ${dataSources.length}`);
	console.log(`  Parties: ${parties.length}`);
	console.log(`  Politicians: ${politicianIds.length}`);
	console.log(`  Organizations: ${orgIds.length}`);
	console.log(`  Commissions: ${commissions.length}`);
	console.log(`  Commission memberships: ${commConnInserted}`);
	console.log(`  Other connections: ~${connInserted}`);
	console.log(`  Votes: ${votes.length}`);
	console.log(`  Vote records: ${vrInserted}`);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
