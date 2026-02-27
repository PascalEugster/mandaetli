"use client";

import dynamic from "next/dynamic";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { GraphSkeleton } from "./GraphSkeleton";

const NetworkGraph = dynamic(() => import("./NetworkGraph"), {
	ssr: false,
	loading: () => <GraphSkeleton />,
});

type GraphContainerProps = {
	actors: GraphActor[];
	connections: GraphConnection[];
	parties: GraphParty[];
};

export function GraphContainer({ actors, connections, parties }: GraphContainerProps) {
	return <NetworkGraph actors={actors} connections={connections} parties={parties} />;
}
