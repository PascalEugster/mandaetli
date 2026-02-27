import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
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
			<body className={`${inter.variable} font-sans antialiased`}>
				<Navigation />
				<main>{children}</main>
			</body>
		</html>
	);
}
