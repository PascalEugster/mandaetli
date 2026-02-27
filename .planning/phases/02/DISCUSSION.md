# Phase 2 Discussion: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Date:** 2026-02-27
**Updated:** 2026-02-27 (incorporated architect feedback)

## Current State

Phase 1 delivered:
- 248 politicians, 522 organizations, 8 parties, 22 commissions (~800 nodes total)
- 2,182 connections with source attribution and confidence levels
- Dark-mode design system with 5 background layers, Swiss red accent
- Supabase local with PostgreSQL, auto-generated TypeScript types

## Architecture Decisions

### 1. Data Flow: Fetch All, Not Lazy-Load

**Payload estimate:** ~780 actors * 120 bytes + ~2182 connections * 140 bytes = ~400KB uncompressed, ~60-80KB gzipped. Smaller than a single hero image.

**Server Component** fetches only graph-relevant fields (not full rows):
```typescript
// app/netzwerk/page.tsx (Server Component)
const [{ data: actors }, { data: connections }] = await Promise.all([
  supabase
    .from("actors")
    .select("id, slug, name, actor_type, canton, council, party_id, abbreviation, color, industry, first_name, last_name"),
  supabase
    .from("connections")
    .select("id, source_actor_id, target_actor_id, connection_type, confidence, role")
    .is("valid_until", null),  // Only active connections
]);
```

**Why not lazy-load:**
- Graph filtering must be instant (<16ms). Network requests on every filter toggle kills UX.
- Path finding between two actors requires the full graph in memory.
- Progressive disclosure is a *rendering* concern, not a *data* concern.

### 2. GraphContainer Pattern: Raw Arrays In, Build Graphology Client-Side

**Server passes raw actor/connection arrays as props.** Graphology graph is built client-side.

Rationale:
- Graphology serialization format is an implementation detail; coupling server to it is fragile
- The builder logic (node colors by party, sizes by type, edge styles) is application-specific and belongs client-side
- Clean separation: server knows Supabase rows, client knows Graphology

**Architecture:**
```
Server Component (page.tsx)
  |-- fetches actors[] + connections[] from Supabase
  |-- passes as serialized JSON props
  v
GraphContainer ("use client", dynamic import ssr:false)
  |-- receives actors[] + connections[]
  v
SigmaContainer (from @react-sigma/core)
  |-- GraphDataLoader (renderless) -- calls buildGraph(), loads into Sigma, starts FA2
  |-- GraphEventHandler (renderless) -- registers Sigma events, bridges to zustand/nuqs
```

**Graph type:** `new Graph({ multi: false, type: "undirected" })` -- deduplicate edges via composite keys: `${source}--${target}--${connectionType}`.

### 3. Progressive Disclosure: Interaction-Driven, Not Camera-Driven

**Key insight from architect:** Zoom levels are driven by user interaction (filter + selection), NOT by camera zoom ratio. Camera zoom controls physical magnification. Semantic zoom is controlled by filter/selection state. These are independent.

**Three view levels:**

**Level 1 -- Overview (default landing state):**
- Show only party nodes (7-8 nodes) with aggregated inter-party edges
- Max ~25 nodes (parties + optionally industry sector aggregates)
- Clean and readable. User understands the landscape at a glance.

**Level 2 -- Filtered:**
- User clicks a party node or applies a filter (e.g., "SVP" + "Canton ZH")
- Show politicians matching filter + their 1-hop neighbors
- **Cap at 80 visible nodes.** If filter produces more, show top 80 by connection degree + "show more"
- Node/edge reducers hide everything outside this set

**Level 3 -- Focused (ego network):**
- User clicks a specific actor node
- Show that actor + all direct connections + connections between neighbors
- Typically 10-40 nodes -- always readable
- Highlight selected node, dim (don't hide) the rest of filtered view

**Transitions:**
```
[Overview] --click party/apply filter--> [Filtered] --click node--> [Focused]
     ^                                       ^                          |
     |                                       |                          |
     +---- "Reset" / clear filters ----------+---- "Back" / deselect --+
```

**viewLevel is derived from URL state:**
- `selected` is set -> viewLevel = "focused"
- Any filter is set -> viewLevel = "filtered"
- Otherwise -> viewLevel = "overview"

### 4. ForceAtlas2 Configuration

```typescript
export const FA2_SETTINGS = {
  barnesHutOptimize: true,   // O(n*log(n)) repulsion instead of O(n^2)
  barnesHutTheta: 0.5,
  gravity: 3,                // Prevents party clusters from drifting apart
  scalingRatio: 15,          // Controls overall spread
  slowDown: 5,               // Damping for smoother animation
  edgeWeightInfluence: 1,
  strongGravityMode: false,
  adjustSizes: true,         // Prevents node overlap
  linLogMode: false,
};
```

**Run strategy:** Fixed 500 iterations, stop after 3 seconds (whichever comes first). Do NOT use convergence detection (unreliable).

**When to re-run FA2:**
- Initial graph load: always (500 iterations)
- Filter change removing/adding >20% nodes: yes (200 iterations)
- Ego network selection: yes (fast, <50 nodes)
- Camera zoom/pan: never

**Layout cache:** After FA2 stabilizes, cache positions in a Map keyed by filter-state hash. Restore on "back" navigation for instant transitions.

### 5. State Management Split

**zustand (ephemeral, NOT in URL):**
- `hoveredNodeId` -- changes on mouse move (60fps), cannot be in URL
- `tooltipPosition` -- pixel coordinates
- `isLayoutRunning` -- FA2 status
- `selectedEdgeId` -- edge detail panel
- `viewLevel` -- derived from URL state

**nuqs (URL-shareable state):**
- `selected` -- selected actor slug
- `parties` -- filter: party IDs (comma-separated array)
- `cantons` -- filter: canton codes
- `councils` -- filter: NR/SR
- `industries` -- filter: industry sectors
- `connectionTypes` -- filter: connection types
- `pathFrom` / `pathTo` -- path-finding endpoints (actor slugs)
- `q` -- search query

**Sigma events bridge pattern:**
- `enterNode` / `leaveNode` -> write to zustand (hover)
- `clickNode` -> write to nuqs (selected slug)
- `clickStage` -> clear nuqs selection
- `clickEdge` -> write to zustand (edge detail)

### 6. Node and Edge Visual Design

**Nodes:**
| Actor Type | Shape | Base Size | Color |
|------------|-------|-----------|-------|
| Person | Circle | 6 | Party color (from party lookup) |
| Organization | Circle | 4 | `#F59E0B` (amber) |
| Party | Circle | 15 | Party's own color |
| Commission | Circle | 4 | `#8B5CF6` (purple) |

**Edge colors by connection type (with alpha for subtlety on dark bg):**
| Type | Color |
|------|-------|
| Mandate | `rgba(59,130,246,0.3)` (blue) |
| Membership | `rgba(16,185,129,0.3)` (green) |
| Lobbying | `rgba(245,158,11,0.3)` (amber) |
| Donation | `rgba(239,68,68,0.3)` (red) |
| Employment | `rgba(148,163,184,0.3)` (gray) |

**Hover state:** Node grows 1.5x, neighbors highlighted, non-neighbors dimmed to 0.15 opacity.
**Selected state:** Node gets Swiss red ring (`borderColor: "#FF0000"`, `borderSize: 3`), detail panel opens.

### 7. Renderless Component Pattern

`@react-sigma/core` is designed for renderless children of SigmaContainer that use hooks:

- **GraphDataLoader** (renderless): Uses `useLoadGraph` to build and load graph, manages FA2 lifecycle
- **GraphEventHandler** (renderless): Uses `useRegisterEvents` to connect Sigma events to React state

This keeps concerns separated and each component testable independently.

### 8. Component Structure (Architect-Refined)

```
src/
  app/
    netzwerk/
      page.tsx                  -- Server Component: fetches data, passes to GraphContainer
      loading.tsx               -- Next.js loading state (graph skeleton)
  components/
    graph/
      GraphContainer.tsx        -- "use client" + dynamic import of GraphCanvas (ssr:false)
      GraphCanvas.tsx           -- SigmaContainer + GraphDataLoader + GraphEventHandler
      GraphDataLoader.tsx       -- Renderless: buildGraph(), load into Sigma, start FA2
      GraphEventHandler.tsx     -- Renderless: Sigma events -> zustand/nuqs
      GraphControls.tsx         -- Filter panel (party, canton, council, industry)
      GraphSearch.tsx           -- Search input + result highlighting + camera zoom-to
      GraphToolbar.tsx          -- Zoom +/-, fit-all, filter toggle, search trigger
      NodeTooltip.tsx           -- Hover tooltip positioned via zustand coords
      EdgeDetailPanel.tsx       -- Slide-in panel for clicked edge details
      GraphLegend.tsx           -- Node color + edge type legend
      GraphSkeleton.tsx         -- Loading skeleton during dynamic import
  lib/
    graph/
      builder.ts               -- buildGraph(actors, connections) -> Graphology Graph
      layout.ts                -- FA2_SETTINGS, layout cache utilities
      filters.ts               -- computeVisibleNodes(graph, filters, selected) -> Set<string>
      colors.ts                -- getNodeColor, getEdgeColor, constants
      paths.ts                 -- findAllPaths(graph, source, target, maxDepth=3)
      search-params.ts         -- nuqs parsers for graph URL state
  stores/
    graph-store.ts             -- zustand store for ephemeral graph UI state
  types/
    graph.ts                   -- GraphActor, GraphConnection (lightweight pick types)
```

### 9. Mobile Strategy

On screens < 768px, the full graph is not usable. Instead show:
- Simplified list/card view of actors grouped by party
- Each card: name, connection count, top connections
- Tap to see full connection list
- Link to desktop for full graph experience

Graph page checks viewport and renders either `<GraphContainer>` or `<MobileActorList>`.

## Open Questions (Resolved)

1. **Graph page route:** `/netzwerk` (German, consistent with German-first UI) -- DECIDED
2. **Progressive disclosure:** Interaction-driven (filter/selection), NOT camera-zoom-driven -- DECIDED (architect)
3. **Commission visibility:** Visible by default, can be filtered out -- DECIDED

## Dependencies

- `sigma` ^3.0.0
- `graphology` ^0.26.0
- `@react-sigma/core` ^5.0.0
- `graphology-layout-forceatlas2` ^0.10.0
- `graphology-shortest-path` (for path-finding)
- `graphology-types` (TypeScript support)

No `graphology-communities-louvain` in Phase 2 (deferred to Phase 4+ as optional auto-cluster mode).
