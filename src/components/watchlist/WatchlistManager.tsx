"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import type { WatchlistItem } from "@/lib/data/watchlist";

type WatchlistManagerProps = {
	token: string;
	items: WatchlistItem[];
};

function actorHref(actor: { slug: string; actor_type: string }) {
	if (actor.actor_type === "person") return `/person/${actor.slug}`;
	if (actor.actor_type === "organization") return `/organization/${actor.slug}`;
	return `/party/${actor.slug}`;
}

function actorDisplayName(actor: WatchlistItem["actor"]) {
	if (actor.first_name && actor.last_name) return `${actor.first_name} ${actor.last_name}`;
	return actor.name;
}

const TYPE_LABELS: Record<string, string> = {
	person: "Politiker:in",
	organization: "Organisation",
	party: "Partei",
};

export function WatchlistManager({ token, items }: WatchlistManagerProps) {
	const router = useRouter();
	const [removing, setRemoving] = useState<string | null>(null);

	async function handleRemove(actorId: string) {
		setRemoving(actorId);
		try {
			const res = await fetch("/api/watchlist", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, actorId }),
			});

			if (res.ok) {
				toast("Entfernt");
				router.refresh();
			} else {
				toast("Fehler beim Entfernen");
			}
		} catch {
			toast("Netzwerkfehler");
		} finally {
			setRemoving(null);
		}
	}

	if (items.length === 0) {
		return (
			<p className="text-text-muted">
				Keine Einträge. Besuchen Sie ein Profil und klicken Sie auf &ldquo;Beobachten&rdquo;.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{items.map((item) => (
				<div
					key={item.id}
					className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-1 p-4"
				>
					<div>
						<Link
							href={actorHref(item.actor)}
							className="font-medium text-text-primary hover:text-swiss-red hover:underline"
						>
							{actorDisplayName(item.actor)}
						</Link>
						<p className="text-xs text-text-muted">
							{TYPE_LABELS[item.actor.actor_type] ?? item.actor.actor_type}
						</p>
					</div>
					<button
						type="button"
						onClick={() => handleRemove(item.actor_id)}
						disabled={removing === item.actor_id}
						className="rounded p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-red-400 disabled:opacity-50"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			))}
		</div>
	);
}
