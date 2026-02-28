import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConflictScore } from "@/components/profiles/ConflictScore";
import { ConnectionList } from "@/components/profiles/ConnectionList";
import { MiniEgoGraphLoader } from "@/components/profiles/MiniEgoGraphLoader";
import { PersonHeader } from "@/components/profiles/PersonHeader";
import { VotingRecord } from "@/components/profiles/VotingRecord";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchButton } from "@/components/watchlist/WatchButton";
import {
	getPersonBySlug,
	getPersonCommissions,
	getPersonConnections,
	getPersonVoteRecords,
} from "@/lib/data/persons";
import { createClient } from "@/lib/supabase/server";
import { calculateConflictScore } from "@/lib/utils/conflict-score";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const person = await getPersonBySlug(slug);
	if (!person) return { title: "Nicht gefunden - Seilschaften.ch" };
	const name =
		person.first_name && person.last_name
			? `${person.first_name} ${person.last_name}`
			: person.name;
	const description = `${name} — Interessenbindungen und politisches Netzwerk`;
	return {
		title: `${name} - Seilschaften.ch`,
		description,
		openGraph: {
			title: `${name} - Seilschaften.ch`,
			description,
			type: "profile",
			siteName: "Seilschaften.ch",
		},
		twitter: {
			card: "summary_large_image",
			title: `${name} - Seilschaften.ch`,
			description,
		},
	};
}

export default async function PersonProfilePage({ params }: Props) {
	const { slug } = await params;
	const person = await getPersonBySlug(slug);
	if (!person) notFound();

	// Phase 2: parallel data fetching
	const [connections, voteRecords, commissions, party, partiesData] = await Promise.all([
		getPersonConnections(person.id),
		getPersonVoteRecords(person.id),
		getPersonCommissions(person.id),
		person.party_id ? getPartyById(person.party_id) : Promise.resolve(null),
		getPartyColors(),
	]);

	// Collect actors needed for conflict score
	const neighborActors = connections.map((c) => c.otherActor);
	const rawConnections = connections.map(({ otherActor: _, ...conn }) => conn);

	const conflictResult = calculateConflictScore({
		personId: person.id,
		connections: rawConnections,
		actors: [person, ...neighborActors],
		voteRecords,
	});

	const commissionNames = commissions.map((c) => c.name);

	return (
		<div className="space-y-6 p-6">
			<PersonHeader
				person={person}
				party={party}
				connectionCount={connections.length}
				commissionNames={commissionNames}
			/>
			<WatchButton actorId={person.id} />

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left column */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Interessenbindungen</CardTitle>
						</CardHeader>
						<CardContent>
							<ConnectionList connections={connections} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Abstimmungsverhalten</CardTitle>
						</CardHeader>
						<CardContent>
							<VotingRecord voteRecords={voteRecords} />
						</CardContent>
					</Card>
				</div>

				{/* Right column */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Interessenkonflikt-Score</CardTitle>
						</CardHeader>
						<CardContent>
							<ConflictScore
								score={conflictResult}
								personName={
									person.first_name && person.last_name
										? `${person.first_name} ${person.last_name}`
										: person.name
								}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Netzwerk</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="hidden lg:block">
								<MiniEgoGraphLoader
									centerActor={person}
									connections={rawConnections}
									neighbors={neighborActors}
									parties={partiesData}
								/>
							</div>
							<Link
								href={`/netzwerk?selected=${person.slug}`}
								className="block text-sm text-swiss-red hover:underline lg:hidden"
							>
								Im Netzwerk anzeigen
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

async function getPartyById(partyId: string) {
	const supabase = await createClient();
	const { data } = await supabase.from("actors").select("*").eq("id", partyId).single();
	return data;
}

async function getPartyColors(): Promise<{ id: string; color: string }[]> {
	const supabase = await createClient();
	const { data } = await supabase.from("actors").select("id, color").eq("actor_type", "party");
	return (data ?? []).filter((p): p is { id: string; color: string } => p.color != null);
}
