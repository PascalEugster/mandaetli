"use client";

import { useLoadGraph } from "@react-sigma/core";
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";
import { useEffect, useRef } from "react";
import { buildGraph } from "@/lib/graph/buildGraph";
import type { GraphActor, GraphConnection, GraphParty } from "@/lib/graph/types";
import { useGraphStore } from "@/stores/graph-store";

const FA2_SETTINGS = {
	barnesHutOptimize: true,
	barnesHutTheta: 0.5,
	gravity: 3,
	scalingRatio: 15,
	slowDown: 5,
	edgeWeightInfluence: 1,
	strongGravityMode: false,
	adjustSizes: true,
	linLogMode: false,
};

const FA2_TIMEOUT_MS = 3000;

type GraphCanvasProps = {
	actors: GraphActor[];
	connections: GraphConnection[];
	parties: GraphParty[];
};

export function GraphCanvas({ actors, connections, parties }: GraphCanvasProps) {
	const loadGraph = useLoadGraph();
	const supervisorRef = useRef<FA2LayoutSupervisor | null>(null);
	const incrementGraphVersion = useGraphStore((s) => s.incrementGraphVersion);

	useEffect(() => {
		const graph = buildGraph(actors, connections, parties);
		loadGraph(graph);
		incrementGraphVersion();

		// Start ForceAtlas2 layout in a Web Worker
		const supervisor = new FA2LayoutSupervisor(graph, {
			settings: FA2_SETTINGS,
		});
		supervisorRef.current = supervisor;
		supervisor.start();

		// Stop after timeout
		const timer = setTimeout(() => {
			supervisor.stop();
		}, FA2_TIMEOUT_MS);

		return () => {
			clearTimeout(timer);
			supervisor.kill();
			supervisorRef.current = null;
		};
	}, [actors, connections, parties, loadGraph, incrementGraphVersion]);

	return null;
}
