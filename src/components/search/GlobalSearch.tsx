"use client";

import { Building2, Flag, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { type SearchResult, searchActors } from "@/lib/data/search";

const TYPE_ICONS: Record<string, typeof User> = {
	person: User,
	organization: Building2,
	party: Flag,
};

const TYPE_LABELS: Record<string, string> = {
	person: "Politiker:innen",
	organization: "Organisationen",
	party: "Parteien",
};

function actorHref(result: SearchResult): string {
	if (result.actor_type === "person") return `/person/${result.slug}`;
	if (result.actor_type === "organization") return `/organization/${result.slug}`;
	return `/party/${result.slug}`;
}

export function GlobalSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

	// Debounced search
	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		if (!query.trim()) {
			setResults([]);
			setIsOpen(false);
			return;
		}
		timerRef.current = setTimeout(async () => {
			const data = await searchActors(query, 8);
			setResults(data);
			setIsOpen(true);
			setActiveIndex(-1);
		}, 250);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [query]);

	// Close on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	// Global "/" shortcut
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const navigate = useCallback(
		(href: string) => {
			setIsOpen(false);
			setQuery("");
			router.push(href);
		},
		[router],
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, -1));
		} else if (e.key === "Enter") {
			if (activeIndex >= 0 && results[activeIndex]) {
				navigate(actorHref(results[activeIndex]));
			} else if (query.trim()) {
				navigate(`/suche?q=${encodeURIComponent(query.trim())}`);
			}
		} else if (e.key === "Escape") {
			setIsOpen(false);
			inputRef.current?.blur();
		}
	};

	// Group results by type
	const grouped = new Map<string, SearchResult[]>();
	for (const r of results) {
		const list = grouped.get(r.actor_type) ?? [];
		list.push(r);
		grouped.set(r.actor_type, list);
	}

	let flatIndex = 0;

	return (
		<div ref={containerRef} className="relative hidden sm:block">
			<div className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-1 px-3 py-1.5">
				<Search size={14} strokeWidth={1.5} className="text-text-muted" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => results.length > 0 && setIsOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder="Suche... ( / )"
					className="w-48 bg-transparent text-body-sm text-text-primary placeholder:text-text-muted outline-none"
				/>
			</div>

			{isOpen && (
				<div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-md border border-border-subtle bg-surface-1 shadow-lg">
					{results.length === 0 ? (
						<p className="p-3 text-sm text-text-muted">Keine Ergebnisse</p>
					) : (
						<div className="max-h-96 overflow-y-auto py-1">
							{Array.from(grouped.entries()).map(([type, items]) => (
								<div key={type}>
									<p className="px-3 pt-2 pb-1 text-xs font-medium text-text-muted">
										{TYPE_LABELS[type] ?? type}
									</p>
									{items.map((result) => {
										const idx = flatIndex++;
										const Icon = TYPE_ICONS[result.actor_type] ?? User;
										return (
											<button
												key={result.id}
												type="button"
												onClick={() => navigate(actorHref(result))}
												className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
													idx === activeIndex
														? "bg-surface-2 text-text-primary"
														: "text-text-secondary hover:bg-surface-2"
												}`}
											>
												<Icon size={14} strokeWidth={1.5} className="shrink-0 text-text-muted" />
												<span className="truncate">
													{result.first_name && result.last_name
														? `${result.first_name} ${result.last_name}`
														: result.name}
												</span>
												{result.actor_type === "person" && result.abbreviation && (
													<span className="shrink-0 text-xs text-text-muted">
														{result.abbreviation}
													</span>
												)}
												{result.actor_type === "person" && result.canton && (
													<span className="shrink-0 text-xs text-text-muted">{result.canton}</span>
												)}
											</button>
										);
									})}
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
