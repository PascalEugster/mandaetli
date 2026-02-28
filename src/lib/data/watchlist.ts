import { createClient } from "@/lib/supabase/server";

export type WatchlistItem = {
	id: string;
	actor_id: string;
	created_at: string;
	actor: {
		name: string;
		slug: string;
		actor_type: string;
		first_name: string | null;
		last_name: string | null;
	};
};

export type WatchlistWithItems = {
	id: string;
	email: string;
	token: string;
	items: WatchlistItem[];
};

export async function getOrCreateWatchlist(email: string): Promise<string> {
	const supabase = await createClient();

	// Try to find existing
	const { data: existing } = await supabase
		.from("watchlists")
		.select("token")
		.eq("email", email)
		.single();

	if (existing) return existing.token;

	// Create new
	const { data: created, error } = await supabase
		.from("watchlists")
		.insert({ email })
		.select("token")
		.single();

	if (error) throw new Error(`Failed to create watchlist: ${error.message}`);
	return created.token;
}

export async function getWatchlistByToken(token: string): Promise<WatchlistWithItems | null> {
	const supabase = await createClient();

	const { data: watchlist } = await supabase
		.from("watchlists")
		.select("id, email, token")
		.eq("token", token)
		.single();

	if (!watchlist) return null;

	const { data: items } = await supabase
		.from("watchlist_items")
		.select("id, actor_id, created_at")
		.eq("watchlist_id", watchlist.id)
		.order("created_at", { ascending: false });

	if (!items || items.length === 0) {
		return { ...watchlist, items: [] };
	}

	// Fetch actor details
	const actorIds = items.map((i) => i.actor_id);
	const { data: actors } = await supabase
		.from("actors")
		.select("id, name, slug, actor_type, first_name, last_name")
		.in("id", actorIds);

	const actorMap = new Map((actors ?? []).map((a) => [a.id, a]));

	const enrichedItems: WatchlistItem[] = [];
	for (const item of items) {
		const actor = actorMap.get(item.actor_id);
		if (!actor) continue;
		enrichedItems.push({
			...item,
			actor: {
				name: actor.name,
				slug: actor.slug,
				actor_type: actor.actor_type,
				first_name: actor.first_name,
				last_name: actor.last_name,
			},
		});
	}

	return { ...watchlist, items: enrichedItems };
}

export async function addToWatchlist(token: string, actorId: string): Promise<boolean> {
	const supabase = await createClient();

	const { data: watchlist } = await supabase
		.from("watchlists")
		.select("id")
		.eq("token", token)
		.single();

	if (!watchlist) return false;

	const { error } = await supabase
		.from("watchlist_items")
		.upsert(
			{ watchlist_id: watchlist.id, actor_id: actorId },
			{ onConflict: "watchlist_id,actor_id" },
		);

	return !error;
}

export async function removeFromWatchlist(token: string, actorId: string): Promise<boolean> {
	const supabase = await createClient();

	const { data: watchlist } = await supabase
		.from("watchlists")
		.select("id")
		.eq("token", token)
		.single();

	if (!watchlist) return false;

	const { error } = await supabase
		.from("watchlist_items")
		.delete()
		.eq("watchlist_id", watchlist.id)
		.eq("actor_id", actorId);

	return !error;
}
