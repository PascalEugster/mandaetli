import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConnectionList } from "@/components/profiles/ConnectionList";
import { MiniEgoGraphLoader } from "@/components/profiles/MiniEgoGraphLoader";
import { OrgHeader } from "@/components/profiles/OrgHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrgBySlug, getOrgConnections } from "@/lib/data/organizations";
import { createClient } from "@/lib/supabase/server";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const org = await getOrgBySlug(slug);
	if (!org) return { title: "Nicht gefunden - Seilschaften.ch" };
	return { title: `${org.name} - Seilschaften.ch` };
}

export default async function OrganizationProfilePage({ params }: Props) {
	const { slug } = await params;
	const org = await getOrgBySlug(slug);
	if (!org) notFound();

	const [connections, partiesData] = await Promise.all([
		getOrgConnections(org.id),
		getPartyColors(),
	]);

	const neighborActors = connections.map((c) => c.otherActor);
	const rawConnections = connections.map(({ otherActor: _, ...conn }) => conn);

	return (
		<div className="space-y-6 p-6">
			<OrgHeader org={org} connectionCount={connections.length} />

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Verbundene Politiker:innen</CardTitle>
						</CardHeader>
						<CardContent>
							<ConnectionList connections={connections} />
						</CardContent>
					</Card>
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle>Netzwerk</CardTitle>
						</CardHeader>
						<CardContent>
							<MiniEgoGraphLoader
								centerActor={org}
								connections={rawConnections}
								neighbors={neighborActors}
								parties={partiesData}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

async function getPartyColors(): Promise<{ id: string; color: string }[]> {
	const supabase = await createClient();
	const { data } = await supabase.from("actors").select("id, color").eq("actor_type", "party");
	return (data ?? []).filter((p): p is { id: string; color: string } => p.color != null);
}
