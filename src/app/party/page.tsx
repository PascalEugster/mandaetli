import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { listParties } from "@/lib/data/parties";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Parteien - Mandaetli.ch",
};

export default async function PartyListPage() {
	const parties = await listParties();

	// Fetch member counts per party
	const supabase = await createClient();
	const { data: persons } = await supabase
		.from("actors")
		.select("party_id")
		.eq("actor_type", "person")
		.not("party_id", "is", null);

	const memberCounts: Record<string, number> = {};
	if (persons) {
		for (const p of persons) {
			if (p.party_id) {
				memberCounts[p.party_id] = (memberCounts[p.party_id] ?? 0) + 1;
			}
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Parteien</h1>
				<p className="text-sm text-text-secondary">{parties.length} Parteien</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{parties.map((party) => {
					const position = party.ideology_position != null ? Number(party.ideology_position) : null;
					return (
						<Link key={party.id} href={`/party/${party.slug}`}>
							<Card className="h-full transition-colors hover:border-border-default">
								<CardContent>
									<div className="flex items-center gap-3">
										{party.color && (
											<div
												className="size-3 rounded-full"
												style={{ backgroundColor: party.color }}
											/>
										)}
										<span className="text-lg font-bold text-text-primary">
											{party.abbreviation}
										</span>
										<span className="text-sm text-text-secondary">{party.name}</span>
									</div>

									<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
										{party.seats_nr != null && <span>{party.seats_nr} NR-Sitze</span>}
										{party.seats_sr != null && <span>{party.seats_sr} SR-Sitze</span>}
										<span>{memberCounts[party.id] ?? 0} Mitglieder</span>
									</div>

									{position != null && (
										<div className="mt-3">
											<div className="relative h-1.5 rounded-full bg-surface-2">
												<div
													className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full"
													style={{
														left: `${(position / 10) * 100}%`,
														backgroundColor: party.color ?? "#64748b",
													}}
												/>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
