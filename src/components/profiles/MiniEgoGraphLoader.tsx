"use client";

import dynamic from "next/dynamic";
import type { Actor, Connection } from "@/types/domain";

const MiniEgoGraph = dynamic(
	() => import("@/components/profiles/MiniEgoGraph").then((m) => m.MiniEgoGraph),
	{
		ssr: false,
		loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-surface-1" />,
	},
);

type MiniEgoGraphLoaderProps = {
	centerActor: Actor;
	connections: Connection[];
	neighbors: Actor[];
	parties: { id: string; color: string }[];
};

export function MiniEgoGraphLoader(props: MiniEgoGraphLoaderProps) {
	return <MiniEgoGraph {...props} />;
}
