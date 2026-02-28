import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ActorCardProps = {
	name: string;
	href: string;
	subtitle?: string;
	meta?: string[];
	badge?: { label: string; color: string };
};

export function ActorCard({ name, href, subtitle, meta, badge }: ActorCardProps) {
	return (
		<Link
			href={href}
			className="block rounded-lg border border-border-subtle bg-surface-1 p-4 transition-colors hover:bg-surface-2"
		>
			<div className="flex items-center gap-2">
				<span className="font-medium text-text-primary">{name}</span>
				{badge && (
					<Badge className="text-white" style={{ backgroundColor: badge.color }}>
						{badge.label}
					</Badge>
				)}
			</div>
			{subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
			{meta && meta.length > 0 && (
				<div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
					{meta.map((item) => (
						<span key={item}>{item}</span>
					))}
				</div>
			)}
		</Link>
	);
}
