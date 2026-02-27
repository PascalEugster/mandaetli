import { GraphContainer } from "@/components/graph/GraphContainer";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { createClient } from "@/lib/supabase/server";

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
			<GraphContainer actors={actors} connections={connections} parties={parties} />
		</div>
	);
}
