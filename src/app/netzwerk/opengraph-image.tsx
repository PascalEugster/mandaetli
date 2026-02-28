import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Seilschaften.ch - Netzwerk der Schweizer Politik";

export default function OGImage() {
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
					gap: 20,
				}}
			>
				{/* Title */}
				<div style={{ display: "flex", fontSize: 28, color: "#94a3b8" }}>Seilschaften.ch</div>

				<div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#ffffff" }}>
					Netzwerk der Schweizer Politik
				</div>

				<div style={{ display: "flex", fontSize: 24, color: "#64748b" }}>
					Interaktive Visualisierung der Verbindungen zwischen Politiker:innen, Parteien und
					Organisationen
				</div>
			</div>
		</div>,
		{ ...size },
	);
}
