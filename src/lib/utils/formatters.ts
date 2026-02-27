import { CANTONS, CONFIDENCE_LABELS, CONNECTION_TYPE_LABELS } from "./constants";

/**
 * Format a date string as Swiss format (dd.MM.yyyy)
 */
export function formatSwissDate(dateStr: string | null): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	return date.toLocaleDateString("de-CH", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/**
 * Format a relative time string in German ("vor 2 Tagen", "vor 3 Stunden")
 */
export function formatRelativeTime(dateStr: string | null): string {
	if (!dateStr) return "Nie";
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 1) return "Gerade eben";
	if (diffMinutes < 60) return `vor ${diffMinutes} Minuten`;
	if (diffHours < 24) return `vor ${diffHours} Stunden`;
	if (diffDays === 1) return "Gestern";
	if (diffDays < 30) return `vor ${diffDays} Tagen`;
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `vor ${months} Monat${months > 1 ? "en" : ""}`;
	}
	const years = Math.floor(diffDays / 365);
	return `vor ${years} Jahr${years > 1 ? "en" : ""}`;
}

/**
 * Get canton name from its two-letter code
 */
export function cantonName(code: string | null): string {
	if (!code) return "";
	return CANTONS[code] ?? code;
}

/**
 * Get display label for a connection type
 */
export function connectionTypeLabel(type: string): string {
	return CONNECTION_TYPE_LABELS[type]?.label ?? type;
}

/**
 * Get display label for a confidence level
 */
export function confidenceLabel(level: string): string {
	return CONFIDENCE_LABELS[level]?.label ?? level;
}

/**
 * Get description for a confidence level
 */
export function confidenceDescription(level: string): string {
	return CONFIDENCE_LABELS[level]?.description ?? "";
}

/**
 * Format a council type for display
 */
export function formatCouncil(council: string | null): string {
	if (council === "NR") return "Nationalrat";
	if (council === "SR") return "Standerat";
	return "";
}

/**
 * Format an actor's full name (person: "First Last", others: name)
 */
export function formatActorName(actor: {
	actor_type: string;
	name: string;
	first_name: string | null;
	last_name: string | null;
}): string {
	if (actor.actor_type === "person" && actor.first_name && actor.last_name) {
		return `${actor.first_name} ${actor.last_name}`;
	}
	return actor.name;
}
