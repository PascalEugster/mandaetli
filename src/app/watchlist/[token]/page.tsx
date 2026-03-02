import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";
import { getWatchlistByToken } from "@/lib/data/watchlist";

export const metadata: Metadata = {
	title: "Beobachtungsliste - Mandaetli.ch",
};

type Props = {
	params: Promise<{ token: string }>;
};

function maskEmail(email: string): string {
	const [local, domain] = email.split("@");
	if (!domain) return email;
	const masked =
		local.length > 2
			? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`
			: local;
	return `${masked}@${domain}`;
}

export default async function WatchlistPage({ params }: Props) {
	const { token } = await params;
	const watchlist = await getWatchlistByToken(token);

	if (!watchlist) notFound();

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold text-text-primary">Beobachtungsliste</h1>
				<p className="text-sm text-text-secondary">{maskEmail(watchlist.email)}</p>
			</div>

			<WatchlistManager token={token} items={watchlist.items} />

			<div className="rounded border border-border-subtle bg-surface-1 p-4 text-sm text-text-muted">
				<p>
					Speichern Sie diesen Link, um Ihre Beobachtungsliste jederzeit zu verwalten. In Zukunft
					erhalten Sie Benachrichtigungen per E-Mail, wenn sich die Verbindungen beobachteter
					Akteure andern.
				</p>
			</div>
		</div>
	);
}
