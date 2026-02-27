import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
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
	title: "Seilschaften.ch — Swiss Political Transparency",
	description:
		"Visualize connections between Swiss politicians, parties, companies, and lobby groups. Built on public data from official Swiss registers.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" className="dark">
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
				<AppShell>{children}</AppShell>
			</body>
		</html>
	);
}
