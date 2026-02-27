import { create } from "zustand";

type TooltipPosition = {
	x: number;
	y: number;
};

type GraphStore = {
	// Hover state
	hoveredNodeId: string | null;
	tooltipPosition: TooltipPosition | null;
	hoveredEdgeId: string | null;
	hoverTimestamp: number;

	// Selection state (ephemeral -- edge selection is zustand, node selection via nuqs)
	selectedEdgeId: string | null;

	// Layout state
	isLayoutRunning: boolean;

	// Actions
	setHoveredNode: (nodeId: string | null, position?: TooltipPosition) => void;
	setHoveredEdge: (edgeId: string | null) => void;
	setSelectedEdge: (edgeId: string | null) => void;
	setLayoutRunning: (running: boolean) => void;
	clearAll: () => void;
};

export const useGraphStore = create<GraphStore>((set) => ({
	hoveredNodeId: null,
	tooltipPosition: null,
	hoveredEdgeId: null,
	hoverTimestamp: 0,
	selectedEdgeId: null,
	isLayoutRunning: false,

	setHoveredNode: (nodeId, position) =>
		set({
			hoveredNodeId: nodeId,
			tooltipPosition: position ?? null,
			hoverTimestamp: nodeId ? Date.now() : 0,
		}),

	setHoveredEdge: (edgeId) => set({ hoveredEdgeId: edgeId }),

	setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId }),

	setLayoutRunning: (running) => set({ isLayoutRunning: running }),

	clearAll: () =>
		set({
			hoveredNodeId: null,
			tooltipPosition: null,
			hoveredEdgeId: null,
			hoverTimestamp: 0,
			selectedEdgeId: null,
		}),
}));
