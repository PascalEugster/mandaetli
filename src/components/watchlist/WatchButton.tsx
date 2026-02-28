"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

type WatchButtonProps = {
	actorId: string;
};

export function WatchButton({ actorId }: WatchButtonProps) {
	const [showForm, setShowForm] = useState(false);
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [managementUrl, setManagementUrl] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim()) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/watchlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, actorId }),
			});

			if (!res.ok) {
				const data = await res.json();
				toast(data.error ?? "Fehler beim Speichern");
				return;
			}

			const data = await res.json();
			setManagementUrl(data.managementUrl);
			toast("Zur Beobachtungsliste hinzugefugt");
			setShowForm(false);
			setEmail("");
		} catch {
			toast("Netzwerkfehler");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="inline-flex flex-col gap-2">
			{!showForm && !managementUrl && (
				<button
					type="button"
					onClick={() => setShowForm(true)}
					className="inline-flex items-center gap-1.5 rounded border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
				>
					<Eye className="size-4" />
					Beobachten
				</button>
			)}

			{showForm && (
				<form onSubmit={handleSubmit} className="flex items-center gap-2">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="E-Mail-Adresse"
						required
						className="rounded border border-border-subtle bg-surface-1 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-swiss-red focus:outline-none"
					/>
					<button
						type="submit"
						disabled={submitting}
						className="rounded bg-swiss-red px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{submitting ? "..." : "Speichern"}
					</button>
					<button
						type="button"
						onClick={() => setShowForm(false)}
						className="text-sm text-text-muted hover:text-text-primary"
					>
						Abbrechen
					</button>
				</form>
			)}

			{managementUrl && (
				<Link
					href={managementUrl}
					className="inline-flex items-center gap-1.5 text-sm text-swiss-red hover:underline"
				>
					<Eye className="size-4" />
					Beobachtungsliste verwalten
				</Link>
			)}
		</div>
	);
}
