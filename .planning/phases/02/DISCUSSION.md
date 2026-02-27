# Phase 2 Discussion: Network Graph Visualization

**Phase:** 2 of 5
**Requirements:** GRAPH-01 through GRAPH-10
**Date:** 2026-02-27

## Current State

Phase 1 delivered:
- 248 politicians, 522 organizations, 8 parties, 22 commissions (800 nodes total)
- 2,182 connections with source attribution and confidence levels
- Dark-mode design system with 5 background layers, Swiss red accent
- Supabase local with PostgreSQL, auto-generated TypeScript types

## Architecture Decisions

### 1. Sigma.js 3 + Graphology Pipeline

**Data flow:** Supabase (server) -> API route -> Graphology graph (client) -> Sigma.js (WebGL)

- **Server Component** fetches all actors + connections from Supabase
- **Serialized** as JSON props to the client graph component
- **Client Component** (`"use client"`) builds Graphology graph and passes to Sigma.js
- `@react-sigma/core` v5 provides React bindings with hooks (`useSigma`, `useRegisterEvents`, `useLoadGraph`)

**Graph instance management:**
- Graphology graph created inside `@react-sigma/core`'s `<SigmaContainer>` context
- No need for zustand for the graph instance itself -- `useSigma()` hook provides access
- zustand used for UI state: selected node, hovered node, active filters, panel visibility
- nuqs used for URL-shareable state: filters, selected actor, zoom level

**Dynamic import** required -- Sigma.js uses WebGL and cannot run in SSR:
```tsx
const NetworkGraph = dynamic(() => import("@/components/graph/NetworkGraph"), { ssr: false });
```

### 2. Progressive Disclosure / Semantic Zoom

800 nodes + 2,182 edges is manageable for WebGL but unreadable without progressive disclosure.

**Approach: Camera-based visibility with Sigma.js reducers**

Rather than swapping subgraphs (which loses layout continuity), use Sigma.js `nodeReducer` and `edgeReducer` to control what's visible based on camera zoom ratio:

- **Level 1 (ratio < 0.3) -- Party Overview:** Show only party nodes (8) and aggregated inter-party edges. Politician/org nodes hidden. Party nodes sized by member count.
- **Level 2 (0.3 <= ratio < 0.7) -- Actor Detail:** Show individual politician/org nodes within viewport. Labels appear. Party nodes become cluster backgrounds.
- **Level 3 (ratio >= 0.7) -- Connection Detail:** Full labels, edge labels on hover, confidence badges visible. All connection metadata accessible.

Zoom thresholds tuned based on testing. The camera `updated` event fires on zoom/pan and triggers reducer recalculation.

### 3. ForceAtlas2 Web Worker

**Strategy: Pre-compute + interactive refinement**

1. Compute initial ForceAtlas2 layout on graph load using `graphology-layout-forceatlas2/worker`
2. Run for ~3-5 seconds (or until convergence), then stop
3. User can drag nodes -- on drop, run a short FA2 burst to settle neighbors
4. Filter changes trigger a new FA2 burst to reorganize visible subgraph

**Next.js Web Worker considerations:**
- Web Workers require a separate entry point. With Next.js + Turbopack, use `new Worker(new URL('./fa2.worker.ts', import.meta.url))`
- The `graphology-layout-forceatlas2` package provides `createWorker()` which handles this internally
- Must be in a `"use client"` component (no SSR)

### 4. Data Loading Strategy

**Load everything upfront.** 800 nodes + 2,182 edges is ~200-300KB JSON. This is well within acceptable limits for a single fetch. Benefits:
- No complex pagination logic
- Instant filter response (client-side filtering)
- Path-finding between any two nodes works without additional fetches
- ForceAtlas2 needs the full graph to compute layout

**Query:** Single Supabase query joining actors + connections, fetched in the page's Server Component and passed as props.

### 5. Filter Architecture

**Approach: Sigma.js reducers (not graph mutation)**

Filters stored in zustand + nuqs. When filters change:
1. Update zustand store
2. nuqs syncs to URL
3. Sigma.js `nodeReducer` checks each node against active filters
4. Hidden nodes return `{ hidden: true }` from reducer
5. `edgeReducer` hides edges where either endpoint is hidden

This preserves the Graphology graph intact (no add/remove) and keeps transitions smooth.

**Filter dimensions:**
- Party: multi-select (SVP, SP, FDP, Mitte, Grune, GLP, EVP)
- Canton: multi-select (26 cantons)
- Council: NR / SR / both
- Industry sector: multi-select (22 industries)
- Actor type: person / organization / party (toggle)

### 6. Node and Edge Visual Design

**Nodes:**
| Actor Type | Shape | Base Size | Color |
|------------|-------|-----------|-------|
| Person | Circle | 6px | Party color (from `actors.party_id` -> party `color` column) |
| Organization | Diamond/Square | 5px | `#F59E0B` (amber) |
| Party | Circle | 12px (scaled by seats) | Party's own color |
| Commission | Hexagon | 4px | `#8B5CF6` (purple) |

**Edges:**
| Connection Type | Style | Color |
|-----------------|-------|-------|
| Mandate (Verwaltungsrat) | Solid, 2px | `#64748B` |
| Membership | Solid, 1px | `#475569` |
| Lobbying | Dashed, 1.5px | `#EF4444` (red tint) |
| Donation | Dotted, 1px | `#F59E0B` |
| Employment | Solid, 1px | `#3B82F6` |

Edge opacity scales with confidence: verified 1.0, declared 0.8, media_reported 0.5, inferred 0.3.

**Hover state:** Node grows 1.5x, neighbors highlighted, non-neighbors dimmed to 0.15 opacity.
**Selected state:** Node gets Swiss red ring, detail panel opens.

### 7. Interaction Design

**Node hover:** Tooltip with name, party, canton, connection count
**Node click:** Select node -> open detail panel (right side) showing all connections. Second click on different node while first selected -> path-finding mode.
**Edge hover:** Show connection type, role, confidence badge
**Edge click:** Show full connection details in panel

**Search within graph:** Command palette (Cmd+K) or dedicated search input on graph toolbar. Results highlight matching node and zoom camera to it.

**Path finding:** When two nodes selected, use Graphology shortest-path algorithm (`graphology-shortest-path`). Highlight all paths, dim everything else.

### 8. Component Structure

```
src/
  app/
    netzwerk/
      page.tsx              -- Server Component: fetch data, render client wrapper
  components/
    graph/
      NetworkGraph.tsx      -- "use client", main graph container with SigmaContainer
      GraphCanvas.tsx       -- Graph loading, FA2 worker, event handlers
      GraphToolbar.tsx      -- Zoom controls, layout toggle, search trigger
      GraphFilters.tsx      -- Filter panel (party, canton, council, industry)
      GraphDetailPanel.tsx  -- Right-side panel for selected node/edge details
      GraphTooltip.tsx      -- Hover tooltip
      GraphSearch.tsx       -- Search within graph (cmd+k integration)
      GraphLegend.tsx       -- Color/shape legend
    graph/hooks/
      useGraphData.ts       -- Transform Supabase data to Graphology format
      useGraphFilters.ts    -- zustand store for filter state + nuqs sync
      useGraphInteraction.ts -- Hover, select, path-finding state
      useForceLayout.ts     -- FA2 worker management
      useSemanticZoom.ts    -- Camera listener for zoom-level-based rendering
  lib/
    graph/
      buildGraph.ts         -- Convert actors+connections to Graphology graph
      graphStyles.ts        -- Node/edge visual properties by type
      pathFinding.ts        -- Shortest path utilities
```

### 9. Mobile Strategy

On screens < 768px, the full graph is not usable. Instead show:
- A simplified list/card view of actors grouped by party
- Each card shows name, connection count, top connections
- Tap to see full connection list
- Link to desktop for full graph experience

The graph page checks viewport and renders either `<NetworkGraph>` or `<MobileActorList>`.

## Open Questions

1. **Graph page route:** `/netzwerk` (German) consistent with German-first UI
2. **Performance threshold:** Need to test if 800 nodes + 2,182 edges maintains 60fps on mid-range hardware
3. **Commission visibility:** Commissions are modeled as org actors -- should they appear as distinct nodes or be hidden by default?

## Dependencies

- `sigma` ^3.0.0
- `graphology` ^0.26.0
- `@react-sigma/core` ^5.0.0
- `graphology-layout-forceatlas2` ^0.10.0
- `graphology-communities-louvain` ^0.8.0 (optional -- for auto-clustering)
- `graphology-shortest-path` (for path-finding)
- `graphology-types` (TypeScript support)
