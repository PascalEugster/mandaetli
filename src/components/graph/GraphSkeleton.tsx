export function GraphSkeleton() {
	return (
		<div className="flex h-full w-full items-center justify-center bg-base">
			<div className="flex flex-col items-center gap-4">
				{/* Simulated graph nodes */}
				<div className="relative h-48 w-48">
					<div className="absolute left-[20%] top-[15%] h-4 w-4 animate-pulse rounded-full bg-surface-3" />
					<div
						className="absolute left-[60%] top-[10%] h-6 w-6 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "200ms" }}
					/>
					<div
						className="absolute left-[80%] top-[40%] h-3 w-3 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "400ms" }}
					/>
					<div
						className="absolute left-[40%] top-[50%] h-8 w-8 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "100ms" }}
					/>
					<div
						className="absolute left-[10%] top-[60%] h-5 w-5 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "300ms" }}
					/>
					<div
						className="absolute left-[70%] top-[75%] h-4 w-4 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "500ms" }}
					/>
					<div
						className="absolute left-[35%] top-[85%] h-3 w-3 animate-pulse rounded-full bg-surface-3"
						style={{ animationDelay: "150ms" }}
					/>
				</div>
				<p className="text-body-sm text-text-muted">Graph wird geladen...</p>
			</div>
		</div>
	);
}
