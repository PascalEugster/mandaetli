import type { Metadata } from "next";
import { ConnectionExplorer } from "@/components/graph/ConnectionExplorer";
import { GraphContainer } from "@/components/graph/GraphContainer";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Netzwerk - Seilschaften.ch",
	description:
		"Interaktive Visualisierung der Verbindungen zwischen Schweizer Politiker:innen, Parteien und Organisationen.",
	openGraph: {
		title: "Netzwerk - Seilschaften.ch",
		description:
			"Interaktive Visualisierung der Verbindungen zwischen Schweizer Politiker:innen, Parteien und Organisationen.",
		type: "website",
		siteName: "Seilschaften.ch",
	},
	twitter: {
		card: "summary_large_image",
		title: "Netzwerk - Seilschaften.ch",
	},
};

export default async function NetzwerkPage() {
	const supabase = await createClient();

	const [{ data: actorsRaw }, { data: connectionsRaw }, { data: partiesRaw }] = await Promise.all([
		supabase
			.from("actors")
			.select(
				"id, slug, name, actor_type, canton, council, party_id, abbreviation, color, industry, first_name, last_name, seats_nr, seats_sr",
			),
		supabase
			.from("connections")
			.select("id, source_actor_id, target_actor_id, connection_type, confidence, role")
			.is("valid_until", null),
		supabase.from("actors").select("id, color").eq("actor_type", "party"),
	]);

	const actors = (actorsRaw ?? []) as unknown as GraphActor[];
	const connections = (connectionsRaw ?? []) as unknown as GraphConnection[];
	const parties = (partiesRaw ?? []) as unknown as GraphParty[];

	return (
		<div className="h-full w-full bg-base">
			{/* Desktop: full graph */}
			<div className="hidden h-full w-full md:block">
				<GraphContainer actors={actors} connections={connections} parties={parties} />
			</div>
			{/* Mobile: card-based explorer */}
			<div className="block md:hidden">
				<ConnectionExplorer actors={actors} connections={connections} parties={parties} />
			</div>
		</div>
	);
}
