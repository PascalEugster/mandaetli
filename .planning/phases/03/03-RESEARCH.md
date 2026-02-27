# Phase 3: Profiles and Search - Research

**Researched:** 2026-02-27
**Domain:** Next.js App Router SSR pages, Supabase queries, pg_trgm search, Sigma.js mini-graph embedding
**Confidence:** HIGH

## Summary

Phase 3 adds profile pages for politicians, organizations, and parties, plus a global search with autocomplete and list views. The existing stack (Next.js 16 App Router, Supabase, Sigma.js, Tailwind CSS 4) handles all requirements without new dependencies. The database already has a GIN trigram index on `actors.name` (`idx_actors_name_trgm`) and comprehensive B-tree indexes on connections, making search and profile queries fast.

The main technical decisions: (1) Use Next.js Server Components for profile pages with parallel Supabase queries for each data section, (2) Use a Supabase RPC function for search (combining `pg_trgm` similarity + `ILIKE` for fast autocomplete), (3) Embed mini ego-graphs as client components using the existing `@react-sigma/core` + `graphology` stack with dynamic import, (4) Implement conflict-of-interest scoring as a pure function comparing connection industries to vote topic categories.

**Primary recommendation:** Build profile pages as SSR Server Components fetching data via parallel Supabase queries. Add a `search_actors` Postgres function exposed via Supabase RPC for autocomplete. Embed mini ego-graphs via dynamic import of a lightweight Sigma.js component.

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router SSR, dynamic routes | Already in use, `generateStaticParams` not needed for mock data |
| @supabase/ssr | 0.8.0 | Server-side Supabase client | Already in use via `createClient()` |
| @react-sigma/core | 5.x | Sigma.js React bindings | Already in use for /netzwerk page |
| graphology | 0.26.0 | Graph data structure | Already in use |
| nuqs | 2.x | URL state management | Already in use for graph filters |
| lucide-react | 0.575.0 | Icons | Already in use |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| radix-ui | 1.4.3 | Headless UI primitives | Dialog for search modal, tabs for profile sections |
| class-variance-authority | 0.7.1 | Variant styling | Badge, button variants |
| tailwind-merge | 3.5.0 | Class merging | cn() utility |

### New (no installs needed)
No new dependencies required. All requirements are covered by the existing stack.

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── person/
│   ├── page.tsx              # List all politicians
│   └── [slug]/
│       └── page.tsx          # Politician profile
├── organization/
│   ├── page.tsx              # List all organizations
│   └── [slug]/
│       └── page.tsx          # Organization profile
├── party/
│   ├── page.tsx              # List all parties
│   └── [slug]/
│       └── page.tsx          # Party profile
└── suche/
    └── page.tsx              # Full search results page

src/lib/
├── data/
│   ├── persons.ts            # Server-side person queries
│   ├── organizations.ts      # Server-side org queries
│   ├── parties.ts            # Server-side party queries
│   ├── connections.ts        # Connection queries (shared)
│   ├── votes.ts              # Vote record queries
│   └── search.ts             # Search RPC wrapper
└── utils/
    └── conflict-score.ts     # Conflict-of-interest algorithm

src/components/
├── profiles/
│   ├── PersonHeader.tsx       # Name, photo, party, canton, council
│   ├── ConnectionList.tsx     # Reusable connection table
│   ├── VotingRecord.tsx       # Vote history table
│   ├── ConflictScore.tsx      # COI score display with methodology
│   ├── MiniEgoGraph.tsx       # Client component: mini Sigma.js graph
│   ├── OrgHeader.tsx          # Org name, industry, legal form
│   ├── PartyHeader.tsx        # Party info, seats, ideology
│   ├── PartyMembers.tsx       # Sortable member list
│   └── IndustryHeatmap.tsx    # Cross-party industry comparison
├── search/
│   ├── GlobalSearch.tsx       # TopBar search with autocomplete dropdown
│   ├── SearchResults.tsx      # Full search results page content
│   └── SearchFilters.tsx      # Party, canton, council, type filters
└── lists/
    ├── ActorListPage.tsx      # Shared list page shell
    └── SortableHeader.tsx     # Clickable column header for sorting
```

### Pattern 1: Server Component Profile Pages
**What:** Profile pages are async Server Components that fetch data via parallel Supabase queries.
**When to use:** Every profile page (`/person/[slug]`, `/organization/[slug]`, `/party/[slug]`).
**Example:**
```typescript
// src/app/person/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Parallel queries for all profile sections
  const [{ data: person }, { data: connections }, { data: voteRecords }] = await Promise.all([
    supabase.from("actors").select("*").eq("slug", slug).eq("actor_type", "person").single(),
    supabase.from("connections")
      .select("*, source:actors!connections_source_actor_id_fkey(*), target:actors!connections_target_actor_id_fkey(*)")
      .or(`source_actor_id.eq.${person_id},target_actor_id.eq.${person_id}`)
      .is("valid_until", null),
    supabase.from("vote_records")
      .select("*, vote:votes(*)")
      .eq("actor_id", person_id),
  ]);

  if (!person) notFound();

  return <PersonProfile person={person} connections={connections} voteRecords={voteRecords} />;
}
```

**Note on Next.js 16 params:** The `params` prop is now a Promise that must be awaited. This is a breaking change from Next.js 14.

### Pattern 2: Two-Phase Data Fetching for Profile Pages
**What:** First fetch the actor by slug, then use its ID for related data queries.
**When to use:** All profile pages need the actor ID before querying connections.
**Example:**
```typescript
// First: get the actor
const { data: person } = await supabase
  .from("actors").select("*").eq("slug", slug).eq("actor_type", "person").single();
if (!person) notFound();

// Then: parallel queries using the ID
const [{ data: connections }, { data: voteRecords }, { data: party }, { data: commissions }] = await Promise.all([
  supabase.from("connections")
    .select("id, connection_type, confidence, role, is_paid, source_url, valid_from, source_actor_id, target_actor_id")
    .or(`source_actor_id.eq.${person.id},target_actor_id.eq.${person.id}`)
    .is("valid_until", null),
  supabase.from("vote_records").select("decision, vote:votes(*)").eq("actor_id", person.id),
  person.party_id ? supabase.from("actors").select("name, abbreviation, color, slug").eq("id", person.party_id).single() : { data: null },
  supabase.from("connections")
    .select("target:actors!connections_target_actor_id_fkey(name, slug, actor_type)")
    .eq("source_actor_id", person.id)
    .eq("connection_type", "membership"),
]);
```

### Pattern 3: Dynamic Import for Mini Ego-Graph
**What:** The mini ego-graph is a client component using Sigma.js, loaded via `next/dynamic` to avoid SSR issues with WebGL.
**When to use:** Profile pages that need a mini network visualization.
**Example:**
```typescript
import dynamic from "next/dynamic";
const MiniEgoGraph = dynamic(() => import("@/components/profiles/MiniEgoGraph"), { ssr: false });
```

### Pattern 4: Supabase RPC for Search
**What:** A Postgres function using `pg_trgm` similarity for fuzzy search, exposed via Supabase `.rpc()`.
**When to use:** Global search autocomplete.
**Example:**
```sql
-- Migration: search_actors function
CREATE OR REPLACE FUNCTION search_actors(query TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID, slug TEXT, name TEXT, first_name TEXT, last_name TEXT,
  actor_type actor_type, canton TEXT, council council_type,
  party_id UUID, abbreviation TEXT, color TEXT, portrait_url TEXT,
  industry TEXT, similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.slug, a.name, a.first_name, a.last_name,
         a.actor_type, a.canton, a.council,
         a.party_id, a.abbreviation, a.color, a.portrait_url,
         a.industry,
         similarity(a.name, query) AS similarity
  FROM actors a
  WHERE a.name % query OR a.name ILIKE '%' || query || '%'
  ORDER BY similarity(a.name, query) DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

### Pattern 5: URL-Based Sorting for List Views
**What:** Sorting state stored in URL via nuqs for shareable list views.
**When to use:** All list pages (`/person`, `/organization`, `/party`).
**Example:**
```typescript
import { parseAsString, useQueryState } from "nuqs";

const [sortBy, setSortBy] = useQueryState("sort", parseAsString.withDefault("name"));
const [sortDir, setSortDir] = useQueryState("dir", parseAsString.withDefault("asc"));
```

### Anti-Patterns to Avoid
- **N+1 queries for connections:** Never fetch connections one-by-one. Use `.or()` with both `source_actor_id` and `target_actor_id` in a single query.
- **Full graph load for mini ego-graph:** Never load all 800 nodes for a profile page mini-graph. Fetch only the actor's direct connections (1-hop neighborhood).
- **Client-side search over all actors:** With 778 actors, client-side fuzzy search is tempting but won't scale. Use Postgres `pg_trgm` for server-side search from the start.
- **Fetching ALL connections for a party page:** A party has ~60 members, each with ~8 connections = ~480 connections. This is fine as a single query with join, no pagination needed at v1 scale.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy text search | Custom client-side Levenshtein/Fuse.js | PostgreSQL `pg_trgm` via Supabase RPC | Already indexed (GIN), handles typos, 778 actors is trivial for Postgres |
| Sortable tables | Custom sort state management | nuqs + Supabase `.order()` | URL-shareable, server-side sorting for correctness |
| Graph rendering | Custom SVG/Canvas ego-graph | Existing Sigma.js + Graphology stack | Consistency with /netzwerk page, already works |
| Conflict-of-interest score | ML-based analysis | Simple industry-vote overlap formula | Transparency requirement demands explainable algorithm |
| Autocomplete dropdown | Custom dropdown with keyboard nav | Radix Popover + Command pattern | Accessibility, keyboard navigation, focus management |

## Common Pitfalls

### Pitfall 1: Supabase Row Limit on Connections
**What goes wrong:** Supabase returns max 1000 rows by default (PGRST_MAX_ROWS). A party aggregate query joining all member connections could exceed this.
**Why it happens:** PostgrestConfig default. Already hit this bug in Phase 1 (confidence counts).
**How to avoid:** Use `{ count: "exact", head: true }` for aggregates. For actual data, verify expected row counts (max ~480 for a party's connections) are under 1000, or use `.range()` pagination.
**Warning signs:** Missing data in party aggregate views, connection counts that cap at exactly 1000.

### Pitfall 2: Two-Phase Query Waterfall
**What goes wrong:** Fetching the actor by slug, then using its ID for related queries creates a waterfall (sequential, not parallel).
**Why it happens:** Can't know the actor ID before the first query returns.
**How to avoid:** Accept the waterfall for the first query (it's a primary key lookup, ~1ms). Then parallelize ALL subsequent queries using `Promise.all()`. This is unavoidable and fast.
**Warning signs:** Profile pages loading slowly with visible content popping in.

### Pitfall 3: Sigma.js SSR Crash
**What goes wrong:** Importing Sigma.js in a Server Component causes `window is not defined` errors.
**Why it happens:** Sigma.js requires browser APIs (WebGL, Canvas).
**How to avoid:** Always use `next/dynamic` with `{ ssr: false }` for any component that imports from `sigma` or `@react-sigma/core`. This is already the pattern used in Phase 2.
**Warning signs:** Build errors mentioning `window`, `document`, or `WebGLRenderingContext`.

### Pitfall 4: Connection Direction Ambiguity
**What goes wrong:** Connections have `source_actor_id` and `target_actor_id`. When querying "all connections for person X", you need BOTH directions.
**Why it happens:** The graph is stored as directed edges but treated as undirected in the UI.
**How to avoid:** Always query with `.or(`source_actor_id.eq.${id},target_actor_id.eq.${id}`)`. Then in the UI, determine the "other" actor by checking which side is NOT the current profile.
**Warning signs:** Profile page showing only half the expected connections.

### Pitfall 5: Search Debouncing
**What goes wrong:** Every keystroke triggers a Supabase RPC call, causing flickering results and wasted API calls.
**Why it happens:** No debounce on the search input.
**How to avoid:** Debounce search input by 200-300ms. Use a simple `setTimeout`/`clearTimeout` pattern or a `useDeferredValue` for the search query.
**Warning signs:** Flickering autocomplete results, high Supabase usage.

## Code Examples

### Search RPC Call from Client
```typescript
// Client-side search call
const supabase = createBrowserClient();
const { data } = await supabase.rpc("search_actors", {
  query: searchTerm,
  max_results: 10,
});
```

### Connection Resolution (Determining "Other" Actor)
```typescript
function resolveConnection(
  conn: Connection,
  currentActorId: string,
  actorMap: Map<string, Actor>
) {
  const otherId = conn.source_actor_id === currentActorId
    ? conn.target_actor_id
    : conn.source_actor_id;
  const otherActor = actorMap.get(otherId);
  return { ...conn, otherActor };
}
```

### Conflict-of-Interest Score Algorithm
```typescript
// Simple, transparent algorithm:
// 1. Get all industries from person's connections (org industry field)
// 2. Get all vote topic_categories from person's vote_records
// 3. Map topic_categories to industries (predefined mapping)
// 4. Score = (votes where person has industry connection) / (total votes) * 100
// 5. Display as percentage with full methodology explanation

const TOPIC_TO_INDUSTRY: Record<string, string[]> = {
  "Gesundheit": ["pharma", "medtech", "healthcare", "insurance"],
  "Finanzen": ["banking", "insurance", "real_estate"],
  "Energie": ["energy"],
  "Verkehr": ["transport"],
  "Landwirtschaft": ["agriculture", "food"],
  "Bildung": ["education"],
  "Verteidigung": ["defense"],
  "Telekommunikation": ["telecommunications", "technology"],
  // ... more mappings
};

function calculateConflictScore(
  connections: Connection[],
  orgMap: Map<string, Actor>,
  voteRecords: VoteRecord[],
  votes: Vote[]
): { score: number; overlappingVotes: VoteWithOverlap[]; totalVotes: number } {
  // Get connected industries
  const connectedIndustries = new Set(
    connections
      .map(c => {
        const orgId = c.source_actor_id === personId ? c.target_actor_id : c.source_actor_id;
        return orgMap.get(orgId)?.industry;
      })
      .filter(Boolean)
  );

  // Check each vote for industry overlap
  let overlappingCount = 0;
  const overlappingVotes = [];

  for (const record of voteRecords) {
    const vote = votes.find(v => v.id === record.vote_id);
    if (!vote?.topic_category) continue;
    const relatedIndustries = TOPIC_TO_INDUSTRY[vote.topic_category] ?? [];
    const hasOverlap = relatedIndustries.some(ind => connectedIndustries.has(ind));
    if (hasOverlap) {
      overlappingCount++;
      overlappingVotes.push({ vote, record, industries: relatedIndustries.filter(i => connectedIndustries.has(i)) });
    }
  }

  return {
    score: voteRecords.length > 0 ? (overlappingCount / voteRecords.length) * 100 : 0,
    overlappingVotes,
    totalVotes: voteRecords.length,
  };
}
```

### Mini Ego-Graph Data Fetching
```typescript
// Fetch only 1-hop neighborhood for mini graph
async function fetchEgoGraphData(actorId: string, supabase: SupabaseClient) {
  const { data: connections } = await supabase
    .from("connections")
    .select("id, source_actor_id, target_actor_id, connection_type, confidence, role")
    .or(`source_actor_id.eq.${actorId},target_actor_id.eq.${actorId}`)
    .is("valid_until", null);

  // Collect unique neighbor IDs
  const neighborIds = new Set<string>();
  for (const conn of connections ?? []) {
    neighborIds.add(conn.source_actor_id === actorId ? conn.target_actor_id : conn.source_actor_id);
  }

  // Fetch neighbor actors
  const { data: neighbors } = await supabase
    .from("actors")
    .select("id, slug, name, actor_type, canton, council, party_id, abbreviation, color, industry, first_name, last_name")
    .in("id", [...neighborIds]);

  return { connections: connections ?? [], neighbors: neighbors ?? [] };
}
```

### Industry Heatmap Data Structure
```typescript
// For cross-party industry heatmap
type IndustryPartyMatrix = {
  industries: string[];         // row labels
  parties: { name: string; abbreviation: string; color: string }[];  // column labels
  matrix: number[][];           // [industry][party] = connection count
};

// Build from all connections + actors
function buildIndustryHeatmap(
  connections: Connection[],
  actors: Actor[]
): IndustryPartyMatrix {
  const personMap = new Map(actors.filter(a => a.actor_type === "person").map(a => [a.id, a]));
  const orgMap = new Map(actors.filter(a => a.actor_type === "organization").map(a => [a.id, a]));
  const partyMap = new Map(actors.filter(a => a.actor_type === "party").map(a => [a.id, a]));

  const matrix: Record<string, Record<string, number>> = {};

  for (const conn of connections) {
    const person = personMap.get(conn.source_actor_id) ?? personMap.get(conn.target_actor_id);
    const org = orgMap.get(conn.source_actor_id) ?? orgMap.get(conn.target_actor_id);
    if (!person || !org || !org.industry || !person.party_id) continue;

    const party = partyMap.get(person.party_id);
    if (!party?.abbreviation) continue;

    matrix[org.industry] ??= {};
    matrix[org.industry][party.abbreviation] = (matrix[org.industry][party.abbreviation] ?? 0) + 1;
  }

  return { industries: Object.keys(matrix), parties: [...partyMap.values()], matrix };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` | App Router async Server Components | Next.js 13+ | Profile pages use `async function Page()` not gSSP |
| `useRouter().query` | `params` as Promise (Next.js 16) | Next.js 15+ | Must `await params` in dynamic routes |
| Fuse.js client-side search | PostgreSQL pg_trgm server-side | N/A (architectural choice) | Better accuracy, no bundle size, handles typos via DB |
| Separate search API route | Supabase RPC direct call | N/A | Fewer moving parts, same performance |

## Open Questions

1. **Party heatmap visualization**
   - What we know: Need to show industry connections across parties as a matrix
   - What's unclear: CSS grid with colored cells? Or use a charting library?
   - Recommendation: Use a CSS grid with opacity-based coloring (darker = more connections). No charting library needed for a simple heatmap grid. Keeps bundle small.

2. **Commission memberships display**
   - What we know: Commissions are modeled as actors with `actor_type='organization'` and connections with `connection_type='membership'`
   - What's unclear: How to distinguish commissions from regular organizations in queries
   - Recommendation: The seed data uses specific org names for commissions. Query connections where the target actor name matches commission patterns, or add an `org_type` field. For now, filter by the known commission names from constants.ts or by checking if name contains "Kommission".

3. **Search architecture: RPC vs API route**
   - What we know: Both work. RPC is simpler (direct DB call). API route allows caching/rate-limiting.
   - Recommendation: Use Supabase RPC for v1 simplicity. Add API route in Phase 4 if caching is needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-01 | Politician profile: name, photo, party, canton, council, commissions, election date | Server Component with parallel queries, PersonHeader component |
| PROF-02 | Politician Interessenbindungen with org name, role, compensation, source link | ConnectionList component with confidence badges |
| PROF-03 | Politician mini network graph | MiniEgoGraph client component via dynamic import |
| PROF-04 | Organization profile: all connected politicians with roles | OrgHeader + ConnectionList, two-phase query pattern |
| PROF-05 | Organization mini network graph | Same MiniEgoGraph component, reusable |
| PROF-06 | Party profile: members, aggregate stats, top industries | PartyHeader + PartyMembers + aggregate queries |
| PROF-07 | Industry/branch heatmap across parties | IndustryHeatmap component with CSS grid |
| PROF-08 | Politician voting record | VotingRecord component, vote_records + votes join |
| PROF-09 | Conflict-of-interest score | ConflictScore component with TOPIC_TO_INDUSTRY mapping |
| PROF-10 | COI methodology transparency | Expandable section in ConflictScore showing formula and data |
| SRCH-01 | Global search with instant autocomplete | GlobalSearch component + search_actors RPC function |
| SRCH-02 | Results grouped by actor type with ranking | Search RPC returns actor_type, UI groups results |
| SRCH-03 | Search filters: party, canton, council, type | SearchFilters component with nuqs URL state |
| SRCH-04 | Persistent navigation structure | Sidebar NAV_ITEMS enabled (remove disabled flag) |
| SRCH-05 | List views with sorting | ActorListPage + SortableHeader + nuqs sort state |
</phase_requirements>

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: schema, indexes, components, patterns
- PostgreSQL pg_trgm documentation (built-in extension, verified in DB)
- Next.js 16 App Router (verified via package.json version)

### Secondary (MEDIUM confidence)
- Supabase `.rpc()` method for calling Postgres functions
- Sigma.js mini-graph embedding pattern (extrapolated from existing /netzwerk usage)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and working
- Architecture: HIGH - patterns extrapolated from working Phase 2 code
- Pitfalls: HIGH - several discovered from real Phase 1 bugs (row limit, SSR crashes)
- Search: HIGH - pg_trgm index already exists, RPC is standard Supabase pattern
- Conflict scoring: MEDIUM - algorithm is custom, needs validation with real data

**Research date:** 2026-02-27
**Valid until:** indefinite (stable stack, no external dependencies changing)
