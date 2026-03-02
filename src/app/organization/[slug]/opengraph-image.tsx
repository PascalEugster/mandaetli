import { ImageResponse } from "next/og";
import { getOrgBySlug } from "@/lib/data/organizations";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mandaetli.ch - Organisation Profil";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const org = await getOrgBySlug(slug);
	if (!org) {
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

	// Fetch connection count
	const supabase = await createClient();
	const { count } = await supabase
		.from("connections")
		.select("id", { count: "exact", head: true })
		.eq("target_actor_id", org.id)
		.is("valid_until", null);

	const connectionCount = count ?? 0;

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
			<div style={{ display: "flex", width: 6, height: "100%", backgroundColor: "#FF0000" }} />

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
				{/* Org name */}
				<div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#ffffff" }}>
					{org.name}
				</div>

				{/* Meta */}
				<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
					{org.industry && (
						<div
							style={{
								display: "flex",
								padding: "6px 16px",
								borderRadius: 6,
								backgroundColor: "#1e293b",
								color: "#94a3b8",
								fontSize: 20,
							}}
						>
							{org.industry}
						</div>
					)}
					{org.headquarters && (
						<div style={{ display: "flex", fontSize: 20, color: "#94a3b8" }}>
							{org.headquarters}
						</div>
					)}
				</div>

				{/* Connection count */}
				<div style={{ display: "flex", fontSize: 24, color: "#FF0000", fontWeight: 600 }}>
					{connectionCount} verbundene Politiker:innen
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
