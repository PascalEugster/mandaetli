import { ImageResponse } from "next/og";
import { getPartyBySlug } from "@/lib/data/parties";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mandaetli.ch - Partei Profil";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const party = await getPartyBySlug(slug);
	if (!party) {
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

	const partyColor = (party.color as string) ?? "#64748b";

	// Fetch member count and total connections
	const supabase = await createClient();
	const memberResult = await supabase
		.from("actors")
		.select("id", { count: "exact", head: true })
		.eq("actor_type", "person")
		.eq("party_id", party.id);

	const memberCount = memberResult.count ?? 0;

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
				{/* Party abbreviation circle + name */}
				<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
					<div
						style={{
							display: "flex",
							width: 80,
							height: 80,
							borderRadius: 40,
							backgroundColor: partyColor,
							alignItems: "center",
							justifyContent: "center",
							fontSize: 32,
							fontWeight: 700,
							color: "#ffffff",
						}}
					>
						{party.abbreviation ?? "?"}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						<div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#ffffff" }}>
							{party.name}
						</div>
					</div>
				</div>

				{/* Stats */}
				<div style={{ display: "flex", gap: 32, fontSize: 22, color: "#94a3b8" }}>
					<div style={{ display: "flex" }}>{memberCount} Mitglieder</div>
					{party.seats_nr != null && (
						<div style={{ display: "flex" }}>{party.seats_nr} Sitze NR</div>
					)}
					{party.seats_sr != null && (
						<div style={{ display: "flex" }}>{party.seats_sr} Sitze SR</div>
					)}
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
