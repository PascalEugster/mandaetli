// Swiss cantons
export const CANTONS: Record<string, string> = {
	ZH: "Zurich",
	BE: "Bern",
	LU: "Luzern",
	UR: "Uri",
	SZ: "Schwyz",
	OW: "Obwalden",
	NW: "Nidwalden",
	GL: "Glarus",
	ZG: "Zug",
	FR: "Fribourg",
	SO: "Solothurn",
	BS: "Basel-Stadt",
	BL: "Basel-Landschaft",
	SH: "Schaffhausen",
	AR: "Appenzell Ausserrhoden",
	AI: "Appenzell Innerrhoden",
	SG: "St. Gallen",
	GR: "Graubunden",
	AG: "Aargau",
	TG: "Thurgau",
	TI: "Ticino",
	VD: "Vaud",
	VS: "Valais",
	NE: "Neuchatel",
	GE: "Geneve",
	JU: "Jura",
} as const;

export const CANTON_CODES = Object.keys(CANTONS);

// French-speaking cantons (for multilingual mock data)
export const FRENCH_CANTONS = ["VD", "GE", "NE", "JU", "FR"] as const;
export const ITALIAN_CANTONS = ["TI"] as const;
export const BILINGUAL_CANTONS = ["BE", "FR", "VS"] as const;

// NR seats per canton (2023 legislature)
export const NR_SEATS_PER_CANTON: Record<string, number> = {
	ZH: 36,
	BE: 24,
	VD: 19,
	AG: 16,
	SG: 12,
	GE: 12,
	LU: 10,
	TI: 8,
	VS: 8,
	FR: 7,
	BL: 7,
	SO: 6,
	TG: 6,
	BS: 5,
	GR: 5,
	NE: 4,
	SZ: 4,
	ZG: 3,
	SH: 2,
	JU: 2,
	AR: 1,
	AI: 1,
	GL: 1,
	NW: 1,
	OW: 1,
	UR: 1,
};

// SR seats: 2 per full canton, 1 per half-canton
export const SR_SEATS_PER_CANTON: Record<string, number> = {
	ZH: 2,
	BE: 2,
	LU: 2,
	UR: 2,
	SZ: 2,
	OW: 1,
	NW: 1,
	GL: 2,
	ZG: 2,
	FR: 2,
	SO: 2,
	BS: 1,
	BL: 1,
	SH: 2,
	AR: 1,
	AI: 1,
	SG: 2,
	GR: 2,
	AG: 2,
	TG: 2,
	TI: 2,
	VD: 2,
	VS: 2,
	NE: 2,
	GE: 2,
	JU: 2,
};

// Councils
export const COUNCILS = ["NR", "SR"] as const;

// Major Swiss political parties
export const PARTIES = [
	{
		slug: "svp",
		name: "Schweizerische Volkspartei",
		abbreviation: "SVP",
		color: "#4B8B3B",
		seats_nr: 62,
		seats_sr: 7,
		ideology_position: 8.5,
		founded: 1971,
	},
	{
		slug: "sp",
		name: "Sozialdemokratische Partei",
		abbreviation: "SP",
		color: "#E30613",
		seats_nr: 41,
		seats_sr: 9,
		ideology_position: 2.5,
		founded: 1888,
	},
	{
		slug: "fdp",
		name: "FDP.Die Liberalen",
		abbreviation: "FDP",
		color: "#0064B4",
		seats_nr: 28,
		seats_sr: 9,
		ideology_position: 7.0,
		founded: 2009,
	},
	{
		slug: "mitte",
		name: "Die Mitte",
		abbreviation: "Mitte",
		color: "#F28C00",
		seats_nr: 29,
		seats_sr: 14,
		ideology_position: 5.5,
		founded: 2021,
	},
	{
		slug: "gruene",
		name: "Grune Partei der Schweiz",
		abbreviation: "Grune",
		color: "#84B414",
		seats_nr: 23,
		seats_sr: 5,
		ideology_position: 2.0,
		founded: 1983,
	},
	{
		slug: "glp",
		name: "Grunliberale Partei",
		abbreviation: "GLP",
		color: "#C8D82E",
		seats_nr: 10,
		seats_sr: 0,
		ideology_position: 4.5,
		founded: 2007,
	},
	{
		slug: "evp",
		name: "Evangelische Volkspartei",
		abbreviation: "EVP",
		color: "#FFCC00",
		seats_nr: 2,
		seats_sr: 0,
		ideology_position: 4.0,
		founded: 1919,
	},
] as const;

// NR party seat distribution for mock data (total = 200)
export const NR_PARTY_SEATS: Record<string, number> = {
	svp: 62,
	sp: 41,
	fdp: 28,
	mitte: 29,
	gruene: 23,
	glp: 10,
	evp: 2,
	other: 5,
};

// Parliamentary commissions
export const COMMISSIONS = [
	{ code: "APK", name: "Aussenpolitische Kommission" },
	{ code: "FK", name: "Finanzkommission" },
	{ code: "GPK", name: "Geschaftsprufungskommission" },
	{ code: "KVF", name: "Kommission fur Verkehr und Fernmeldewesen" },
	{ code: "RK", name: "Kommission fur Rechtsfragen" },
	{ code: "SGK", name: "Kommission fur soziale Sicherheit und Gesundheit" },
	{ code: "SiK", name: "Sicherheitspolitische Kommission" },
	{ code: "SPK", name: "Staatspolitische Kommission" },
	{ code: "UREK", name: "Kommission fur Umwelt, Raumplanung und Energie" },
	{ code: "WAK", name: "Kommission fur Wirtschaft und Abgaben" },
	{ code: "WBK", name: "Kommission fur Wissenschaft, Bildung und Kultur" },
] as const;

// Swiss industry sectors
export const INDUSTRIES = [
	"banking",
	"insurance",
	"pharma",
	"medtech",
	"energy",
	"agriculture",
	"technology",
	"defense",
	"consulting",
	"legal",
	"real_estate",
	"transport",
	"telecommunications",
	"media",
	"retail",
	"food",
	"tourism",
	"construction",
	"chemicals",
	"ngo",
	"education",
	"healthcare",
	"trade_association",
] as const;

// Connection type definitions with labels
export const CONNECTION_TYPES = [
	{
		type: "mandate",
		label: "Verwaltungsratsmandat",
		description: "Mitglied des Verwaltungsrats",
	},
	{ type: "board_member", label: "Vorstandsmitglied", description: "Mitglied des Vorstands" },
	{ type: "advisory", label: "Beirat", description: "Mitglied eines Beirats" },
	{
		type: "foundation",
		label: "Stiftungsrat",
		description: "Mitglied eines Stiftungsrats",
	},
	{
		type: "membership",
		label: "Mitgliedschaft",
		description: "Mitglied einer Organisation",
	},
	{
		type: "lobbying",
		label: "Lobbying",
		description: "Lobbying-Verbindung",
	},
	{
		type: "donation",
		label: "Spende",
		description: "Finanzielle Zuwendung",
	},
] as const;

// Data source definitions
export const DATA_SOURCES = [
	{
		id: "parlament-ch",
		name: "parlament.ch",
		url: "https://www.parlament.ch",
		description:
			"Offizielle Daten des Schweizer Parlaments - Ratsmitglieder und Interessenbindungen",
	},
	{
		id: "zefix",
		name: "Zefix / Handelsregister",
		url: "https://www.zefix.admin.ch",
		description:
			"Schweizerisches Handelsamtsblatt - Verwaltungsratsmandate und Unternehmensstrukturen",
	},
	{
		id: "lobbywatch",
		name: "Lobbywatch.ch",
		url: "https://lobbywatch.ch",
		description: "NGO-Daten uber Lobbyismus im Bundeshaus",
	},
	{
		id: "eidg-kanzlei",
		name: "Eidgenossische Bundeskanzlei",
		url: "https://www.bk.admin.ch",
		description: "Transparenz politischer Finanzierung und Abstimmungskomitees",
	},
	{
		id: "media",
		name: "Medienberichte",
		url: "",
		description: "Verbindungen aus offentlichen Medienberichten",
	},
] as const;
