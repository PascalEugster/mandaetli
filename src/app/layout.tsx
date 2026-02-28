import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://seilschaften.ch"),
	title: "Seilschaften.ch",
	description:
		"Visualisiere die Verbindungen zwischen Schweizer Politiker:innen, Parteien, Unternehmen und Lobbygruppen.",
	openGraph: {
		siteName: "Seilschaften.ch",
		locale: "de_CH",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" className="dark">
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
				<NuqsAdapter>
					<AppShell>{children}</AppShell>
					<Toaster />
				</NuqsAdapter>
			</body>
		</html>
	);
}
