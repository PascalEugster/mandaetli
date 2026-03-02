# Architecture Research

**Domain:** Political transparency platform with interactive network graph visualization
**Researched:** 2026-02-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Next.js     │  │  Graph View  │  │  Profile     │              │
│  │  Pages/      │  │  (Sigma.js   │  │  Pages       │              │
│  │  Layouts     │  │  + WebGL)    │  │  (SSR)       │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │    Client Components (CSR)         │  Server Components   │
├─────────┴──────────────────┴─────────────────┴──────────────────────┤
│                      APPLICATION LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Graph Data  │  │  Search /    │  │  Share /     │              │
│  │  Manager     │  │  Filter      │  │  URL State   │              │
│  │  (Graphology)│  │  Engine      │  │  Manager     │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
├─────────┴──────────────────┴─────────────────┴──────────────────────┤
│                      DATA ACCESS LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │              Supabase Client (supabase-js)               │       │
│  │         RLS-aware queries + Real-time subscriptions      │       │
│  └──────────────────────────┬───────────────────────────────┘       │
├─────────────────────────────┴───────────────────────────────────────┤
│                      BACKEND / DATA LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Supabase    │  │  Supabase    │  │  pg_cron     │              │
│  │  PostgreSQL  │  │  Edge        │  │  Scheduled   │              │
│  │  (Graph Data │  │  Functions   │  │  Ingestion   │              │
│  │   + RLS)     │  │  (API Proxy) │  │  Jobs        │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│                      EXTERNAL DATA SOURCES                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │parlament.ch│ │   Zefix    │ │ Lobbywatch │ │ Eidg.      │      │
│  │  OData API │ │  REST API  │ │  JSON API  │ │ Kanzlei    │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Next.js Pages/Layouts** | SSR for SEO-critical pages (profiles, landing), routing, metadata | Graph View, Profile Pages, Supabase Client |
| **Graph View (Sigma.js)** | WebGL rendering of network graph, user interaction (zoom, pan, click), node/edge display | Graphology, Graph Data Manager, URL State |
| **Profile Pages** | Server-rendered actor detail pages (politician, org, party) with all connections listed | Supabase Client, URL State |
| **Graph Data Manager** | Maintains Graphology instance, loads/filters graph data, coordinates layout computation | Sigma.js, Supabase Client, Search/Filter |
| **Graphology** | In-memory graph data structure, layout algorithms (ForceAtlas2 via Web Worker), graph traversal | Sigma.js (rendering), Graph Data Manager |
| **Search/Filter Engine** | Full-text search across actors, filter by type/party/industry, highlight subgraphs | Graph Data Manager, Supabase Client |
| **Share/URL State Manager** | Encodes current view state (selected node, zoom, filters) into shareable URLs | Next.js Router, Graph View, Search/Filter |
| **Supabase Client** | Data fetching with RLS, real-time subscriptions for live updates | PostgreSQL, Edge Functions |
| **Supabase PostgreSQL** | Stores all entities (actors, connections, sources), adjacency model for graph, full-text search indexes | Edge Functions, pg_cron |
| **Edge Functions** | Proxies external API calls, transforms external data into internal schema, handles rate limiting | External APIs, PostgreSQL |
| **pg_cron Jobs** | Scheduled data refresh from external sources (daily/weekly), triggers Edge Functions | Edge Functions, PostgreSQL |
| **External APIs** | Source of truth for political data (parlament.ch, Zefix, Lobbywatch, Eidg. Kanzlei) | Edge Functions (inbound only) |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (dark mode, fonts)
│   ├── page.tsx                # Landing / full graph view
│   ├── graph/
│   │   └── page.tsx            # Full-screen graph explorer
│   ├── person/
│   │   └── [slug]/page.tsx     # Politician profile (SSR)
│   ├── organization/
│   │   └── [slug]/page.tsx     # Organization profile (SSR)
│   ├── party/
│   │   └── [slug]/page.tsx     # Party profile (SSR)
│   ├── search/
│   │   └── page.tsx            # Search results
│   └── api/                    # Next.js API routes (if needed)
│       └── og/[type]/[slug]/route.ts  # OG image generation
├── components/
│   ├── graph/                  # Graph visualization components
│   │   ├── GraphContainer.tsx  # Client wrapper (dynamic import, ssr:false)
│   │   ├── GraphCanvas.tsx     # SigmaContainer + event handlers
│   │   ├── GraphControls.tsx   # Zoom, filter, layout toggles
│   │   ├── NodeTooltip.tsx     # Hover tooltip for nodes
│   │   └── GraphLegend.tsx     # Node type / edge type legend
│   ├── profile/                # Actor profile components
│   │   ├── ActorHeader.tsx     # Name, photo, party, role
│   │   ├── ConnectionList.tsx  # Table of connections with sources
│   │   └── MiniGraph.tsx       # Small ego-network graph
│   ├── search/                 # Search components
│   │   ├── SearchBar.tsx       # Global search input
│   │   └── SearchResults.tsx   # Result list with actor cards
│   └── ui/                     # Shared UI primitives
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── types.ts            # Generated database types
│   ├── graph/
│   │   ├── builder.ts          # Transforms DB rows into Graphology graph
│   │   ├── layout.ts           # ForceAtlas2 worker config
│   │   ├── filters.ts          # Graph filtering logic
│   │   └── colors.ts           # Node/edge color schemes by type
│   └── utils/
│       ├── url-state.ts        # Encode/decode graph state to URL
│       └── formatters.ts       # Swiss-specific formatting (names, dates)
├── hooks/
│   ├── useGraphData.ts         # Fetch + build graph from Supabase
│   ├── useGraphFilters.ts      # Filter state management
│   └── useActorSearch.ts       # Search with debounce
├── types/
│   ├── actor.ts                # Person, Organization, Party types
│   ├── connection.ts           # Edge types (mandate, membership, etc.)
│   └── source.ts               # Data source + confidence level types
└── mock/
    ├── seed.ts                 # Seed script using Faker.js
    ├── actors.ts               # Mock politicians, orgs, parties
    ├── connections.ts           # Mock edges between actors
    └── README.md               # How to use mock data
```

### Structure Rationale

- **`app/`:** Next.js App Router with file-based routing. Profile pages use server components for SEO. Graph pages use client components for interactivity.
- **`components/graph/`:** Isolated graph rendering concern. `GraphContainer` is the critical boundary -- it wraps everything in `dynamic(() => import(...), { ssr: false })` to prevent Sigma.js from running on the server.
- **`lib/graph/`:** Pure logic for building and manipulating the Graphology graph instance, separate from React rendering. This separation allows testing graph logic independently.
- **`lib/supabase/`:** Two clients (browser vs. server) because Supabase auth context differs between environments. Types are auto-generated from the database schema via `supabase gen types`.
- **`mock/`:** First-class mock data directory. Not hidden in tests -- this is a primary development tool used throughout the early phases.

## Architectural Patterns

### Pattern 1: Client-Only Graph Rendering via Dynamic Import

**What:** Sigma.js and Graphology run exclusively in the browser. The graph component tree is wrapped in a `next/dynamic` import with `ssr: false` to prevent server-side execution.
**When to use:** Always, for all graph visualization components. Sigma.js requires `window`, `document`, and WebGL context.
**Trade-offs:** Graph content is not indexable by search engines (acceptable -- profile pages handle SEO). Initial load shows a skeleton/spinner until the client bundle hydrates.

**Example:**
```typescript
// components/graph/GraphContainer.tsx
"use client";

import dynamic from "next/dynamic";
import { GraphSkeleton } from "./GraphSkeleton";

const GraphCanvas = dynamic(() => import("./GraphCanvas"), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

export function GraphContainer({ initialData }: { initialData: GraphData }) {
  return <GraphCanvas data={initialData} />;
}
```

### Pattern 2: Adjacency Model in PostgreSQL for Graph Data

**What:** Store graph data as two core tables: `actors` (nodes) and `connections` (edges). Each connection has `source_actor_id`, `target_actor_id`, `connection_type`, and `data_source`. Use PostgreSQL recursive CTEs for traversal queries (e.g., "find all actors within 2 hops of politician X").
**When to use:** For all graph data storage. This pattern works well at the scale of Swiss federal politics (~246 politicians + ~2000 organizations + ~5000 connections).
**Trade-offs:** Recursive CTEs are less performant than a native graph database for deep traversals (5+ hops), but Swiss political data will not exceed 3-hop queries. PostgreSQL avoids adding another database to the stack.

**Example:**
```sql
-- Core graph tables
CREATE TABLE actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('person', 'organization', 'party')),
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_actor_id UUID REFERENCES actors(id) NOT NULL,
  target_actor_id UUID REFERENCES actors(id) NOT NULL,
  connection_type TEXT NOT NULL,  -- 'mandate', 'membership', 'lobbying', 'donation'
  data_source TEXT NOT NULL,      -- 'parlament.ch', 'zefix', 'lobbywatch'
  confidence TEXT DEFAULT 'verified' CHECK (confidence IN ('verified', 'reported', 'inferred')),
  metadata JSONB DEFAULT '{}',
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_actor_id, target_actor_id, connection_type, data_source)
);

-- Indexes for graph traversal
CREATE INDEX idx_connections_source ON connections(source_actor_id);
CREATE INDEX idx_connections_target ON connections(target_actor_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_actors_type ON actors(actor_type);
CREATE INDEX idx_actors_slug ON actors(slug);
```

### Pattern 3: Server-Fetch, Client-Render Split

**What:** Next.js server components fetch graph data from Supabase during SSR/ISR and pass it as serialized JSON props to the client-side graph component. The client never makes the initial large graph query -- it receives pre-fetched data.
**When to use:** For the main graph view. Keeps the initial data fetch fast (server-to-Supabase is low latency) while allowing full interactivity on the client.
**Trade-offs:** The serialized graph data adds to the HTML payload. For the full Swiss political graph (~10K nodes+edges), this is roughly 200-500KB of JSON -- acceptable for a desktop-first research tool.

**Example:**
```typescript
// app/graph/page.tsx (Server Component)
import { createServerClient } from "@/lib/supabase/server";
import { GraphContainer } from "@/components/graph/GraphContainer";

export default async function GraphPage() {
  const supabase = createServerClient();

  const { data: actors } = await supabase
    .from("actors")
    .select("id, slug, name, actor_type, metadata");

  const { data: connections } = await supabase
    .from("connections")
    .select("id, source_actor_id, target_actor_id, connection_type, confidence");

  return <GraphContainer initialData={{ actors, connections }} />;
}
```

### Pattern 4: ForceAtlas2 Layout in Web Worker

**What:** Graph layout computation (positioning nodes) runs in a dedicated Web Worker via `graphology-layout-forceatlas2/worker`. The main thread stays responsive for user interaction while the layout algorithm iterates.
**When to use:** Whenever the graph has more than ~50 nodes. ForceAtlas2 is computationally expensive and will freeze the UI if run on the main thread.
**Trade-offs:** Web Workers add complexity to state management (the worker communicates via message passing). The `@react-sigma/core` library provides a `useLayoutForceAtlas2` hook that manages the worker lifecycle.

### Pattern 5: Mock-First Data Layer with Swappable Source

**What:** All data access goes through a data access layer that can be backed by either mock data or Supabase. During early development, mock data is seeded into a local Supabase instance (via `supabase db seed`). The application code is identical whether hitting mock or real data.
**When to use:** From day one. The mock data layer is not a temporary hack -- it is the development database.
**Trade-offs:** Requires upfront investment in realistic mock data generation. However, this pays off by unblocking frontend development entirely from API integration timelines.

**Example:**
```typescript
// mock/seed.ts
import { faker } from "@faker-js/faker/locale/de_CH";

const PARTIES = [
  { name: "SVP", slug: "svp", color: "#4B8B3B" },
  { name: "SP", slug: "sp", color: "#E30613" },
  { name: "FDP", slug: "fdp", color: "#0064B4" },
  { name: "Die Mitte", slug: "mitte", color: "#F28C00" },
  { name: "Grüne", slug: "gruene", color: "#84B414" },
  { name: "GLP", slug: "glp", color: "#C8D82E" },
];

function generatePolitician(partySlug: string) {
  return {
    slug: faker.helpers.slugify(faker.person.fullName()).toLowerCase(),
    actor_type: "person",
    name: faker.person.fullName(),
    metadata: {
      party: partySlug,
      canton: faker.helpers.arrayElement(["ZH", "BE", "VD", "GE", "LU", "AG"]),
      council: faker.helpers.arrayElement(["NR", "SR"]),
      portrait_url: faker.image.avatar(),
    },
  };
}
```

## Data Flow

### Primary Data Flows

```
┌─────────────────────────────────────────────────────────────────┐
│ FLOW 1: Initial Graph Load                                      │
│                                                                 │
│ Browser Request                                                 │
│     ↓                                                           │
│ Next.js Server Component (SSR)                                  │
│     ↓                                                           │
│ Supabase Query (actors + connections)                           │
│     ↓                                                           │
│ Serialized JSON in HTML payload                                 │
│     ↓                                                           │
│ Client hydration → Graphology instance built                    │
│     ↓                                                           │
│ ForceAtlas2 Worker computes layout                              │
│     ↓                                                           │
│ Sigma.js renders via WebGL                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FLOW 2: User Interaction (filter, search, select)               │
│                                                                 │
│ User Action (click node, type search, toggle filter)            │
│     ↓                                                           │
│ React state update → URL state encoded                          │
│     ↓                                                           │
│ Graphology graph filtered/highlighted in memory                 │
│     ↓                                                           │
│ Sigma.js re-renders affected nodes/edges (WebGL partial update) │
│     ↓                                                           │
│ URL updated (shareable link reflects current state)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FLOW 3: Data Ingestion Pipeline                                 │
│                                                                 │
│ pg_cron triggers scheduled job (e.g., daily at 03:00 CET)      │
│     ↓                                                           │
│ Edge Function invoked via pg_net HTTP call                      │
│     ↓                                                           │
│ Edge Function fetches from external API                         │
│     │  ├── parlament.ch OData → fetch council members + interests│
│     │  ├── Zefix REST → fetch company board mandates            │
│     │  ├── Lobbywatch JSON → fetch lobbying connections         │
│     │  └── Eidg. Kanzlei → fetch campaign finance data         │
│     ↓                                                           │
│ Edge Function transforms external schema → internal schema      │
│     ↓                                                           │
│ UPSERT into actors / connections tables                         │
│     ↓                                                           │
│ ingestion_log entry written (source, timestamp, record count)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FLOW 4: Profile Page (SEO-optimized)                            │
│                                                                 │
│ Search engine / user visits /person/natalie-rickli              │
│     ↓                                                           │
│ Next.js Server Component                                        │
│     ↓                                                           │
│ Supabase query: actor by slug + all connections + sources       │
│     ↓                                                           │
│ Full HTML rendered on server (SSR) with structured data         │
│     ↓                                                           │
│ Client hydrates: mini ego-graph (optional, client-only)         │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

```
URL Query Parameters (source of truth for shareable state)
    ↕ (sync)
React State (useSearchParams + custom hooks)
    ↓ (derive)
Graphology Graph (filtered view computed from full graph + active filters)
    ↓ (render)
Sigma.js WebGL Canvas
```

State flows unidirectionally: URL params drive React state, which drives graph filtering, which drives rendering. User interactions update URL params, completing the cycle. This makes every view shareable by default.

### Key Data Flows Summary

1. **Graph Load:** Server fetches from Supabase, passes JSON to client, client builds Graphology instance, layout worker positions nodes, Sigma.js renders.
2. **User Interaction:** Client-side only. Filter/search/select updates Graphology in memory, Sigma.js re-renders, URL updates.
3. **Data Ingestion:** Scheduled server-side. pg_cron triggers Edge Functions that fetch from external APIs, transform data, and upsert into PostgreSQL.
4. **Profile Pages:** Server-rendered for SEO. Each actor has a dedicated URL with full metadata and structured data markup.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1K users | Current architecture is sufficient. Single Supabase project, SSR + CSR split, no caching layer needed. |
| 1K-10K users | Add ISR (Incremental Static Regeneration) to profile pages (revalidate every hour). Add Supabase connection pooling via Supavisor. Consider pre-computed graph layouts stored as JSON. |
| 10K-100K users | Add CDN caching for graph data JSON (stale-while-revalidate pattern). Pre-compute graph data as static JSON files regenerated on ingestion. Consider splitting graph data into subgraphs loaded on demand. |
| 100K+ users | Unlikely for a Swiss-specific niche tool. If reached: add Redis cache, consider Neo4j for complex traversals, implement graph data streaming/pagination. |

### Scaling Priorities

1. **First bottleneck: Graph data payload size.** As connections grow, the JSON payload for the full graph increases. Fix: pre-compute and cache graph JSON, regenerate only on ingestion. ISR with 1-hour revalidation.
2. **Second bottleneck: Supabase connection limits.** Many concurrent SSR requests each open a connection. Fix: Supavisor connection pooling (built into Supabase), use transaction mode for edge/serverless.

## Anti-Patterns

### Anti-Pattern 1: Server-Side Rendering the Graph

**What people do:** Try to render Sigma.js or D3 force layouts on the server for "faster" initial paint.
**Why it's wrong:** Sigma.js requires WebGL (browser-only). D3 force simulations require many iterations. Server rendering produces either errors (`window is not defined`) or a static snapshot that must be re-computed on the client anyway.
**Do this instead:** Use `next/dynamic` with `ssr: false`. Show a meaningful skeleton (graph outline with placeholder nodes) during client hydration. Profile pages handle SEO separately.

### Anti-Pattern 2: Neo4j for a Dataset This Size

**What people do:** Choose Neo4j because "it's a graph, so use a graph database."
**Why it's wrong:** Adds operational complexity (separate database, separate hosting, separate query language). Swiss political data is ~10K nodes and ~50K edges at most. PostgreSQL handles this trivially with indexed adjacency lists and recursive CTEs. Neo4j becomes valuable at millions of nodes with deep traversals.
**Do this instead:** PostgreSQL adjacency model in Supabase. If graph query performance becomes a bottleneck later (unlikely), add Apache AGE extension to PostgreSQL or migrate specific queries to Neo4j.

### Anti-Pattern 3: Fetching Graph Data from Client on Every Interaction

**What people do:** Make a Supabase query every time the user clicks a node or applies a filter.
**Why it's wrong:** Creates latency on every interaction, burns Supabase request quota, makes the app feel sluggish. Network graphs need instant feedback.
**Do this instead:** Load the full graph once on initial page load (server-fetch, client-receive). All filtering, searching, and highlighting happens client-side on the Graphology in-memory instance. Only fetch additional data when navigating to a detail page.

### Anti-Pattern 4: Building Real API Integrations Before the UI

**What people do:** Spend weeks integrating parlament.ch and Zefix APIs before building the graph visualization.
**Why it's wrong:** API integration is slow, unpredictable (rate limits, schema changes, downtime), and produces data you cannot visualize yet. You cannot validate UX without seeing the graph.
**Do this instead:** Mock data first. Build the entire graph visualization, profile pages, search, and filtering with realistic mock data seeded into Supabase. Then swap in real data pipelines one source at a time.

### Anti-Pattern 5: Storing Pre-Computed Layouts in the Database

**What people do:** Run ForceAtlas2 on the server and store x/y coordinates in the database.
**Why it's wrong:** Layout depends on the viewport, the current filter state, and user preferences. Pre-computed layouts are stale as soon as a filter changes. They also create a tight coupling between data ingestion and visualization.
**Do this instead:** Compute layout client-side in a Web Worker. The layout runs once on graph load and can be re-triggered when filters change significantly. For performance, cache the most recent layout positions in localStorage so returning users see an instant layout.

## Integration Points

### External Services

| Service | Protocol | Rate Limits | Integration Pattern | Notes |
|---------|----------|-------------|---------------------|-------|
| **parlament.ch** | OData (REST) | Unknown (public, likely generous) | Edge Function fetches paginated OData results, transforms to internal schema | Entities: Person, MemberCouncil, PersonInterest, Vote. Multilingual (de/fr/it). Use `$expand` for nested data. |
| **Zefix** | REST (Swagger) | Unknown (public, likely generous) | Edge Function searches by company name/UID, fetches board members | Endpoint: `zefix.admin.ch/ZefixPublicREST/api/v1`. Returns company details, legal form, SOGC publications. |
| **Lobbywatch** | JSON REST | Unknown (NGO-operated, be respectful) | Edge Function fetches parlamentarier, organisations, interessengruppen | Entities: Parlamentarier, Organisation, Interessengruppe, Zutrittsberechtigung, Branche, Kommission. |
| **Eidg. Kanzlei** | Varies (opendata.swiss) | Unknown | Edge Function fetches campaign finance / Abstimmungskomitee data | Newer data source (since 2021). Format may vary. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components to Client Components | Serialized JSON props | Graph data passed as props, not fetched client-side. Keep serialized payload under 1MB. |
| Client Components to Supabase | supabase-js (REST over HTTPS) | Only for detail page data, search suggestions, and future real-time features. Not for graph data on every interaction. |
| pg_cron to Edge Functions | pg_net HTTP POST | Scheduled triggers. Edge Functions have 60s timeout on free tier, 150s on Pro. Paginate external API calls within this window. |
| Edge Functions to External APIs | HTTPS (fetch) | Use retry logic with exponential backoff. Log all ingestion runs. Handle partial failures gracefully (upsert what succeeded). |
| Graphology to Sigma.js | Direct JS object reference | Sigma.js reads from the Graphology instance. No serialization boundary. Updates to the Graphology graph trigger Sigma.js re-renders. |
| ForceAtlas2 Worker to Main Thread | Web Worker postMessage | Layout positions sent back to main thread. Use `@react-sigma/layout-forceatlas2` hook for lifecycle management. |

## Build Order (Dependency Chain)

Build order is dictated by what depends on what. Each layer must be at least minimally functional before the layer above it can be meaningfully developed.

```
Phase 1: Foundation
  ├── Supabase project + schema (actors, connections tables)
  ├── Mock data seed script (faker-based, realistic Swiss data)
  ├── Next.js project setup (App Router, TypeScript, Tailwind, dark mode)
  └── Supabase client libraries (server + browser)

Phase 2: Core Visualization (depends on Phase 1)
  ├── GraphContainer with dynamic import (ssr: false)
  ├── Graphology builder (DB rows → graph instance)
  ├── Sigma.js rendering with ForceAtlas2 layout
  ├── Basic node styling by actor type
  └── Click-to-select, hover tooltips

Phase 3: Navigation & Profiles (depends on Phase 1, partially Phase 2)
  ├── Actor profile pages (SSR, /person/[slug], /organization/[slug])
  ├── URL state encoding (selected node, filters in query params)
  ├── Global search (Supabase full-text search or pg_trgm)
  └── Mini ego-graph on profile pages

Phase 4: Filtering & Polish (depends on Phase 2, Phase 3)
  ├── Filter by actor type, party, connection type
  ├── Graph legend and controls
  ├── Shareable links with full state
  └── Connection detail panel with source/confidence

Phase 5: Data Ingestion Pipelines (depends on Phase 1 schema, independent of UI)
  ├── parlament.ch ingestion Edge Function
  ├── Zefix ingestion Edge Function
  ├── Lobbywatch ingestion Edge Function
  ├── pg_cron scheduling
  └── Ingestion logging and monitoring

Phase 6: Advanced Features (depends on all above)
  ├── Voting analysis + conflict-of-interest scoring
  ├── Campaign finance Sankey diagrams
  ├── AI-powered natural language queries
  └── Public API for researchers
```

**Key dependency insight:** Phases 2-4 (all UI work) can proceed entirely on mock data. Phase 5 (data ingestion) is independent of the UI and can be developed in parallel once the database schema is stable. This is the core advantage of the mock-first approach: frontend and data pipeline development are decoupled.

## Sources

- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- Official integration docs (HIGH confidence)
- [Sigma.js Official](https://www.sigmajs.org/) -- WebGL graph rendering library (HIGH confidence)
- [React Sigma](https://sim51.github.io/react-sigma/) -- React bindings for Sigma.js, `@react-sigma/core` v5.0.6 (HIGH confidence)
- [Graphology ForceAtlas2 Layout](https://graphology.github.io/standard-library/layout-forceatlas2.html) -- Web Worker-based layout (HIGH confidence)
- [Supabase pgRouting for Graph](https://supabase.com/blog/pgrouting-postgres-graph-database) -- PostgreSQL as graph database pattern (MEDIUM confidence)
- [Supabase Recursive CTEs](https://dev.to/roel_peters_8b77a70a08fdb/beyond-flat-tables-model-hierarchical-data-in-supabase-with-recursive-queries-4ndl) -- Hierarchical data in Supabase (MEDIUM confidence)
- [Supabase Cron + Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions) -- Scheduling data pipelines (HIGH confidence)
- [Supabase Edge Functions Architecture](https://supabase.com/docs/guides/functions/architecture) -- Serverless function patterns (HIGH confidence)
- [Supabase Database Seeding](https://supabase.com/docs/guides/local-development/seeding-your-database) -- Mock data approach (HIGH confidence)
- [supabase-community/seed](https://github.com/supabase-community/seed) -- Schema-based seed generation (MEDIUM confidence)
- [Parlament.ch Open Data](https://www.parlament.ch/en/services/open-data-webservices) -- Swiss Parliament OData API (HIGH confidence)
- [Zefix Public REST API](https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html) -- Swiss commercial register API (HIGH confidence)
- [Lobbywatch API](https://github.com/lobbywatch/api) -- Lobbying data JSON API (HIGH confidence)
- [Next.js Lazy Loading / Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) -- SSR-safe client component loading (HIGH confidence)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- Component boundary patterns (HIGH confidence)
- [Awesome OGD Switzerland](https://github.com/rnckp/awesome-ogd-switzerland) -- Swiss open data catalog (MEDIUM confidence)

---
*Architecture research for: Mandaetli.ch -- Swiss political transparency platform*
*Researched: 2026-02-27*
