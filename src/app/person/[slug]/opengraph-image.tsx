import { ImageResponse } from "next/og";
import { getPersonBySlug } from "@/lib/data/persons";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mandaetli.ch - Politiker:in Profil";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const person = await getPersonBySlug(slug);
	if (!person) {
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					backgroundColor: "#080c14",
					color: "#ffffff",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 32,
				}}
			>
				Nicht gefunden
			</div>,
			{ ...size },
		);
	}

	const name =
		person.first_name && person.last_name
			? `${person.first_name} ${person.last_name}`
			: person.name;

	// Fetch party and connection count
	const supabase = await createClient();
	const [partyResult, connResult] = await Promise.all([
		person.party_id
			? supabase.from("actors").select("abbreviation, color").eq("id", person.party_id).single()
			: Promise.resolve({ data: null }),
		supabase
			.from("connections")
			.select("id", { count: "exact", head: true })
			.eq("source_actor_id", person.id)
			.is("valid_until", null),
	]);

	const party = partyResult.data;
	const connectionCount = connResult.count ?? 0;
	const partyColor = (party?.color as string) ?? "#64748b";

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				backgroundColor: "#080c14",
				fontFamily: "sans-serif",
			}}
		>
			{/* Left accent bar */}
			<div style={{ display: "flex", width: 6, height: "100%", backgroundColor: partyColor }} />

			{/* Content */}
			<div
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					padding: "60px 80px",
					gap: 24,
				}}
			>
				{/* Name */}
				<div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#ffffff" }}>
					{name}
				</div>

				{/* Meta badges */}
				<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
					{party?.abbreviation && (
						<div
							style={{
								display: "flex",
								padding: "6px 16px",
								borderRadius: 6,
								backgroundColor: partyColor,
								color: "#ffffff",
								fontSize: 22,
								fontWeight: 600,
							}}
						>
							{party.abbreviation}
						</div>
					)}
					{person.canton && (
						<div style={{ display: "flex", fontSize: 22, color: "#94a3b8" }}>{person.canton}</div>
					)}
					{person.council && (
						<div style={{ display: "flex", fontSize: 22, color: "#94a3b8" }}>
							{person.council === "NR" ? "Nationalrat" : "Ständerat"}
						</div>
					)}
				</div>

				{/* Connection count */}
				<div style={{ display: "flex", fontSize: 24, color: "#FF0000", fontWeight: 600 }}>
					{connectionCount} Verbindungen
				</div>

				{/* Site name */}
				<div style={{ display: "flex", fontSize: 18, color: "#64748b", marginTop: 20 }}>
					Mandaetli.ch
				</div>
			</div>
		</div>,
		{ ...size },
	);
}
