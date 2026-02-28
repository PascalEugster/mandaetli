"use client";

import { Link2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function CopyLinkButton() {
	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(window.location.href);
				toast("Link kopiert");
			}}
			className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
			title="Link kopieren"
		>
			<Link2 size={16} strokeWidth={1.5} />
		</button>
	);
}
