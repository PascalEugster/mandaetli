import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryHeatmap, type IndustryPartyMatrix } from "@/components/profiles/IndustryHeatmap";
import { PartyHeader } from "@/components/profiles/PartyHeader";
import { PartyMembers } from "@/components/profiles/PartyMembers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartyBySlug, getPartyConnectionStats, getPartyMembers } from "@/lib/data/parties";
import { createClient } from "@/lib/supabase/server";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const party = await getPartyBySlug(slug);
	if (!party) return { title: "Nicht gefunden - Seilschaften.ch" };
	return { title: `${party.abbreviation ?? party.name} (${party.name}) - Seilschaften.ch` };
}

export default async function PartyProfilePage({ params }: Props) {
	const { slug } = await params;
	const party = await getPartyBySlug(slug);
	if (!party) notFound();

	const [members, connectionStats, heatmapData] = await Promise.all([
		getPartyMembers(party.id),
		getPartyConnectionStats(party.id),
		buildHeatmapData(),
	]);

	// Build connection counts per member
	const connectionCounts: Record<string, number> = {};
	const supabase = await createClient();
	const memberIds = members.map((m) => m.id);
	if (memberIds.length > 0) {
		const { data: conns } = await supabase
			.from("connections")
			.select("source_actor_id")
			.in("source_actor_id", memberIds)
			.is("valid_until", null);
		if (conns) {
			for (const conn of conns) {
				connectionCounts[conn.source_actor_id] = (connectionCounts[conn.source_actor_id] ?? 0) + 1;
			}
		}
	}

	// Sort industries by connection count
	const topIndustries = Object.entries(connectionStats)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10);

	return (
		<div className="space-y-6 p-6">
			<PartyHeader party={party} memberCount={members.length} />

			<Card>
				<CardHeader>
					<CardTitle>Mitglieder</CardTitle>
				</CardHeader>
				<CardContent>
					<PartyMembers members={members} connectionCounts={connectionCounts} />
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Branchenverbindungen</CardTitle>
						</CardHeader>
						<CardContent>
							<IndustryHeatmap data={heatmapData} />
						</CardContent>
					</Card>
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle>Top Branchen</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{topIndustries.map(([industry, count]) => (
									<div key={industry} className="flex items-center justify-between">
										<Badge variant="outline">{industry}</Badge>
										<span className="text-sm text-text-secondary">{count}</span>
									</div>
								))}
								{topIndustries.length === 0 && (
									<p className="text-sm text-text-muted">Keine Branchenverbindungen</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

async function buildHeatmapData(): Promise<IndustryPartyMatrix> {
	const supabase = await createClient();

	// Fetch all parties
	const { data: parties } = await supabase
		.from("actors")
		.select("id, abbreviation, color")
		.eq("actor_type", "party")
		.order("seats_nr", { ascending: false });

	if (!parties) return { industries: [], parties: [], matrix: [] };

	// Fetch all person actors with party_id
	const { data: persons } = await supabase
		.from("actors")
		.select("id, party_id")
		.eq("actor_type", "person")
		.not("party_id", "is", null);

	if (!persons) return { industries: [], parties: [], matrix: [] };

	// Fetch all active connections from persons (batched to avoid 1000-row limit)
	const personIds = persons.map((p) => p.id);
	const allConnections: { source_actor_id: string; target_actor_id: string }[] = [];
	const batchSize = 100;
	for (let i = 0; i < personIds.length; i += batchSize) {
		const batch = personIds.slice(i, i + batchSize);
		const { data: batchConns } = await supabase
			.from("connections")
			.select("source_actor_id, target_actor_id")
			.in("source_actor_id", batch)
			.is("valid_until", null)
			.limit(10000);
		if (batchConns) allConnections.push(...batchConns);
	}
	const connections = allConnections;

	if (connections.length === 0) return { industries: [], parties: [], matrix: [] };

	// Fetch target actors with industry
	const targetIds = [...new Set(connections.map((c) => c.target_actor_id))];
	const { data: targets } = await supabase
		.from("actors")
		.select("id, industry")
		.in("id", targetIds)
		.not("industry", "is", null);

	if (!targets) return { industries: [], parties: [], matrix: [] };

	// Build person -> party mapping
	const personPartyMap = new Map(persons.map((p) => [p.id, p.party_id]));
	const targetIndustryMap = new Map(targets.map((t) => [t.id, t.industry as string]));

	// Collect all industries
	const allIndustries = [...new Set(targets.map((t) => t.industry as string))].sort();

	// Build party index (use abbreviation if available, fall back to id prefix)
	const partyList = parties
		.filter((p) => p.abbreviation != null)
		.map((p) => ({
			id: p.id,
			abbreviation: p.abbreviation as string,
			color: (p.color as string) ?? "#64748b",
		}));
	const partyIndex = new Map(partyList.map((p, i) => [p.id, i]));

	// Build matrix: rows = industries, cols = parties
	const matrix: number[][] = allIndustries.map(() => new Array(partyList.length).fill(0));
	const industryIndex = new Map(allIndustries.map((ind, i) => [ind, i]));

	for (const conn of connections) {
		const partyId = personPartyMap.get(conn.source_actor_id);
		const industry = targetIndustryMap.get(conn.target_actor_id);
		if (!partyId || !industry) continue;
		const pIdx = partyIndex.get(partyId);
		const iIdx = industryIndex.get(industry);
		if (pIdx !== undefined && iIdx !== undefined) {
			matrix[iIdx][pIdx]++;
		}
	}

	return {
		industries: allIndustries,
		parties: partyList.map((p) => ({ abbreviation: p.abbreviation, color: p.color })),
		matrix,
	};
}
