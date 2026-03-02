"use client";

import { useEffect, useState } from "react";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { GraphContainer } from "./GraphContainer";

type Props = {
	actors: GraphActor[];
	connections: GraphConnection[];
	parties: GraphParty[];
};

/** Only mounts GraphContainer on md+ screens to avoid Sigma "container has no width" error. */
export function GraphContainerWrapper({ actors, connections, parties }: Props) {
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	if (!isDesktop) return null;

	return (
		<div className="h-full w-full">
			<GraphContainer actors={actors} connections={connections} parties={parties} />
		</div>
	);
}
