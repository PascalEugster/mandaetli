"use client";

import { SigmaContainer, useLoadGraph, useRegisterEvents } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { Actor, Connection } from "@/types/domain";

class MultiGraph extends Graph {
	constructor() {
		super({ multi: true, type: "undirected" });
	}
}

const PERSON_COLOR = "#3b82f6";
const ORG_COLOR = "#22c55e";
const PARTY_COLOR = "#a855f7";

function getColor(actor: Actor): string {
	if (actor.actor_type === "person") return PERSON_COLOR;
	if (actor.actor_type === "party") return PARTY_COLOR;
	return ORG_COLOR;
}

function actorHref(actor: Actor): string {
	if (actor.actor_type === "person") return `/person/${actor.slug}`;
	if (actor.actor_type === "organization") return `/organization/${actor.slug}`;
	return `/party/${actor.slug}`;
}

type MiniEgoGraphProps = {
	centerActor: Actor;
	connections: Connection[];
	neighbors: Actor[];
	parties: { id: string; color: string }[];
};

function GraphEvents() {
	const router = useRouter();
	const registerEvents = useRegisterEvents();

	useEffect(() => {
		registerEvents({
			clickNode: (event) => {
				const href = event.node;
				if (href) router.push(href);
			},
		});
	}, [registerEvents, router]);

	return null;
}

export function MiniEgoGraph({ centerActor, connections, neighbors, parties }: MiniEgoGraphProps) {
	const graph = useMemo(() => {
		const g = new MultiGraph();
		const partyColorMap = new Map(parties.map((p) => [p.id, p.color]));

		// Add center node
		g.addNode(actorHref(centerActor), {
			label:
				centerActor.first_name && centerActor.last_name
					? `${centerActor.first_name} ${centerActor.last_name}`
					: centerActor.name,
			size: 20,
			color: getColor(centerActor),
			x: Math.random(),
			y: Math.random(),
			borderColor:
				centerActor.actor_type === "person" && centerActor.party_id
					? partyColorMap.get(centerActor.party_id)
					: undefined,
		});

		// Add neighbor nodes
		const neighborMap = new Map(neighbors.map((n) => [n.id, n]));
		for (const neighbor of neighbors) {
			const key = actorHref(neighbor);
			if (g.hasNode(key)) continue;
			g.addNode(key, {
				label:
					neighbor.first_name && neighbor.last_name
						? `${neighbor.first_name} ${neighbor.last_name}`
						: neighbor.name,
				size: 10,
				color: getColor(neighbor),
				x: Math.random(),
				y: Math.random(),
			});
		}

		// Add edges
		for (const conn of connections) {
			const sourceActor =
				conn.source_actor_id === centerActor.id
					? centerActor
					: neighborMap.get(conn.source_actor_id);
			const targetActor =
				conn.target_actor_id === centerActor.id
					? centerActor
					: neighborMap.get(conn.target_actor_id);

			if (!sourceActor || !targetActor) continue;

			const sourceKey = actorHref(sourceActor);
			const targetKey = actorHref(targetActor);
			if (!g.hasNode(sourceKey) || !g.hasNode(targetKey)) continue;

			g.addEdge(sourceKey, targetKey, {
				size: 1,
				color: "#334155",
			});
		}

		// Run synchronous ForceAtlas2
		forceAtlas2.assign(g, {
			iterations: 200,
			settings: { gravity: 5, scalingRatio: 10 },
		});

		return g;
	}, [centerActor, connections, neighbors, parties]);

	return (
		<div className="h-[300px] rounded-lg border border-border-subtle bg-surface-0">
			<SigmaContainer
				graph={MultiGraph}
				className="h-full w-full"
				settings={{
					allowInvalidContainer: true,
					renderLabels: true,
					labelSize: 10,
					labelColor: { color: "#94a3b8" },
					defaultEdgeColor: "#334155",
				}}
			>
				<GraphLoader graph={graph} />
				<GraphEvents />
			</SigmaContainer>
		</div>
	);
}

function GraphLoader({ graph }: { graph: Graph }) {
	const loadGraph = useLoadGraph();

	useEffect(() => {
		loadGraph(graph);
	}, [loadGraph, graph]);

	return null;
}
