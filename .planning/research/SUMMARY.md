# Project Research Summary

**Project:** Seilschaften.ch — Swiss Political Transparency Platform
**Domain:** Political transparency / lobbying disclosure platform with interactive network graph visualization
**Researched:** 2026-02-27
**Confidence:** HIGH (stack, architecture) / MEDIUM (features, pitfalls)

## Executive Summary

Seilschaften.ch is a Swiss political transparency platform that cross-references multiple official registers (parlament.ch, Zefix, Lobbyregister, Eidg. Kanzlei) to expose the economic connections of Swiss federal politicians via an interactive network graph. The technical and product patterns for this type of platform are well-established: server-rendered profile pages for SEO, WebGL-based client-side graph rendering for performance, and a PostgreSQL adjacency model for graph data storage at this scale (~10K nodes/edges). The central differentiator is the interactive network graph combined with cross-register data fusion — neither exists in the Swiss civic tech landscape today.

The recommended approach is mock-first development: build the complete UI — graph visualization, profile pages, search, filtering — against realistic mock data seeded into a local Supabase instance, then layer in real data pipelines one source at a time. This decouples frontend development from the unpredictable timelines of external API integration. The technology choices are clear: Next.js 16 + React 19, Sigma.js (WebGL) + Graphology for graph rendering, Supabase for the full backend-as-a-service stack. These are well-documented, mutually compatible, and proven at this scale.

The most significant risks are legal (Swiss DSG data protection law creates DPIA obligations before real data ingestion), graph UX (the "hairball" problem at real data scale requires progressive disclosure architecture baked in from phase one), and data quality (mock data shapes must be informed by real API responses to avoid a painful mismatch). The project must obtain a Swiss data protection legal opinion before transitioning from mock to real data. Building the progressive disclosure pattern into the graph from the start is non-negotiable — retrofitting it is a rewrite.

## Key Findings

### Recommended Stack

The stack is centered on Next.js 16 (App Router, Turbopack, React 19.2) with Supabase as the complete backend (PostgreSQL, Auth, Edge Functions, Storage, Realtime). The graph visualization stack is Sigma.js 3 (WebGL renderer) + Graphology 0.26 (in-memory graph data structure) + @react-sigma/core 5 (React bindings), with graphology-layout-forceatlas2 running in a Web Worker for non-blocking layout computation. UI is Tailwind CSS 4 (CSS-first config, dark mode as identity) with shadcn/ui components. Client state is split between zustand (graph UI state) and nuqs (URL-encoded shareable view state). All versions are verified as of 2026-02-27.

**Core technologies:**
- **Next.js 16 + React 19.2**: Full-stack framework — SSR for SEO-critical profile pages, CSR for graph interactivity. Turbopack default for 2-5x faster builds.
- **Sigma.js 3 + Graphology 0.26**: WebGL graph renderer + in-memory graph data structure — the only viable choice for rendering 246+ politicians with thousands of connections smoothly.
- **@react-sigma/core 5**: React bindings for Sigma.js — hooks-based API, React 19 compatible, eliminates manual DOM management.
- **graphology-layout-forceatlas2**: ForceAtlas2 layout in a Web Worker — non-blocking computation essential for UI responsiveness during layout animation.
- **Supabase (JS SDK 2.97, @supabase/ssr 0.8)**: Full BaaS — PostgreSQL, Auth, Edge Functions, Storage, Realtime in one package. PostgREST v14 auto-generates a public API.
- **Tailwind CSS 4.2 + shadcn/ui**: CSS-first styling with dark-mode-as-identity design system. Zero runtime cost, full customization via component source copy.
- **zustand 5 + nuqs 2.8**: Client state (graph filters, selected node) in zustand; shareable URL state (all view params) in nuqs.
- **@tanstack/react-query 5.90**: Client-side data fetching beyond initial SSR — background refetch, optimistic updates, query invalidation.
- **Zod 4.3 + TypeScript 5.5+**: Schema validation, type inference from API responses, future public API documentation via `.toJSONSchema()`.
- **Biome**: Single-tool linting and formatting (replaces ESLint + Prettier; Next.js 16 removed `next lint`).
- **Vitest 4 + Playwright 1.58**: Unit/component tests and E2E tests respectively.

**Critical version notes:**
- Next.js 16 requires React 19.2+, TypeScript 5.1+ (recommend 5.5+ for Zod v4), Node.js 20+.
- Sigma 3.x requires Graphology as peer dependency.
- Do NOT use `@supabase/auth-helpers-nextjs` (deprecated) — use `@supabase/ssr` 0.8.
- Do NOT use `middleware.ts` (deprecated in Next.js 16) — use `proxy.ts`.

### Expected Features

Research across 8+ active transparency platforms (OpenSecrets, LittleSis, Lobbywatch.ch, TheyWorkForYou, Parltrack, Abgeordnetenwatch) establishes the competitive landscape clearly. The core MVP proposition: "Find and understand any National Council member's economic connections in under 2 minutes."

**Must have for launch (P1 table stakes):**
- Politician profile pages (name, party, canton, photo, all declared Interessenbindungen with source links)
- Organization/company profile pages (reverse lookup: which politicians connect to this org)
- Interactive network graph visualization — the primary differentiator; no Swiss platform has this
- Global search with autocomplete (across politicians and organizations)
- Filtering by party, canton, council, commission (combinable facets)
- Shareable URLs for every view — journalists share links, this is non-negotiable
- Source attribution on every connection (parlament.ch link + confidence level per edge)
- Responsive design (graph desktop-only in v1 is acceptable; profile pages must be mobile-usable)
- Dark-mode design system as visual identity — not a toggle, a foundational choice
- Data freshness indicators ("last updated" per source)

**Should have — add after v1 validation (P2):**
- Zefix/Handelsregister integration — cross-register fusion, the core value prop beyond MVP
- Party-level and industry-level heatmaps — systemic view, critical for journalist use case
- Watchlist with email alerts — TheyWorkForYou's most-used feature by civil society; underrated
- Public API (REST/JSON) — researcher and journalist audience expects programmatic access
- Data export (CSV, JSON, optionally GraphML)
- Voting record display

**Defer to v2+ (P3):**
- Conflict-of-interest scoring on votes — high controversy risk; requires voting data + methodology
- Campaign finance Sankey visualization — law only since 2021, data still sparse
- AI natural language queries — impressive but requires robust structured search underneath first
- Annotation/storytelling layer — requires journalist co-design and significant editor UI
- Lobbyregister integration — data only since 2022, limited coverage
- Linked Open Data / SPARQL endpoint — ecosystem value, zero user-facing v1 value
- Cantonal parliament expansion — 26 different data formats; federal first, always

**Deliberate anti-features (do not build):**
- General public user accounts — shareable URLs replace this; auth complexity/GDPR not worth it
- Crowd-sourced data entry — data quality requires journalistic verification; legal liability
- Political commentary — destroys platform neutrality, attracts attacks from all parties
- Real-time data — parliamentary data changes at legislature cycle speed, not seconds
- Social features — moderation nightmare, off-topic political arguments

### Architecture Approach

The architecture separates concerns cleanly across four layers: server-rendered profile pages (SSR via Next.js Server Components for SEO), a client-only graph visualization engine (Sigma.js + Graphology behind a `next/dynamic` with `ssr: false`), a Supabase data access layer with Row-Level Security, and backend data ingestion pipelines (Edge Functions triggered by pg_cron). The pattern is: server fetches graph data from Supabase during SSR, passes serialized JSON to the client, client builds a Graphology instance, ForceAtlas2 Web Worker computes layout, and Sigma.js renders via WebGL. All user interactions (filter, search, select) operate client-side on the Graphology in-memory instance — no round-trips per interaction.

**Major components:**
1. **GraphContainer** — Client boundary; `next/dynamic(ssr: false)` wrapper; the critical SSR guard for Sigma.js
2. **Graphology instance** — In-memory graph data structure; all filtering and graph logic operates here
3. **Sigma.js WebGL renderer** — Reads from Graphology; GPU-accelerated rendering for 5K+ nodes
4. **ForceAtlas2 Web Worker** — Layout computation off the main thread; manages via `useLayoutForceAtlas2` hook
5. **Profile pages (Server Components)** — SSR with structured data markup; SEO-optimized actor detail pages
6. **URL State Manager** — nuqs encodes selected node, zoom, active filters into shareable URL
7. **Supabase Client (server + browser)** — Two clients via `@supabase/ssr`; RLS-aware; types auto-generated via `supabase gen types`
8. **Ingestion Edge Functions** — Fetch from external APIs (parlament.ch OData, Zefix REST, Lobbywatch JSON), transform to internal schema, upsert into PostgreSQL
9. **pg_cron** — Schedules ingestion jobs (daily at 03:00 CET); triggers Edge Functions via pg_net
10. **Mock data layer** — Realistic Swiss-locale faker data seeded into local Supabase; not a temporary hack but the primary development database through phases 1-4

**Core database model:**
```sql
actors (id, slug, actor_type, name, metadata JSONB)
connections (id, source_actor_id, target_actor_id, connection_type, data_source, confidence, valid_from, valid_until)
```
Indexed for traversal. PostgreSQL recursive CTEs handle 2-3 hop queries at this scale. Neo4j is unnecessary and adds operational complexity — Swiss political data will not exceed ~10K nodes.

### Critical Pitfalls

1. **Swiss DSG data protection law creates DPIA obligations** — Cross-referencing public registers into a unified politician profile constitutes "profiling" under Art. 5 DSG, potentially requiring a Data Protection Impact Assessment. Get a Swiss data protection legal opinion before ingesting any real data. Build a correction/deletion request workflow (Art. 32 DSG) from day one. Publish a legal basis page. Do not ingest data beyond what official registers declare.

2. **Network graph hairball at real data scale** — The graph looks clean with 30 mock nodes. With 246+ politicians and power-law connection distributions (UBS, Credit Suisse connected to 20+ politicians each), it collapses into an unreadable mass. Design progressive disclosure from the start: default view should never show all 246 politicians. Implement semantic zoom levels (party clusters → party members → politician connections → edge detail). Set hard node limit (~50-80 visible at once). This cannot be retrofitted — it requires rearchitecting from scratch if built wrong.

3. **Building on the deprecated parlament.ch OData endpoint** — The historic ws-old.parlament.ch API is being superseded by OpenParlData.ch. Build an abstraction layer between ingestion and domain model from day one. Test both endpoints before committing. Use Lobbywatch.ch as cross-validation. Cache aggressively (legislature-cycle data changes infrequently).

4. **Mock data shapes not informed by real API responses** — Idealized mock data breaks catastrophically on real integration: different field names, Unix timestamps vs. ISO dates, inconsistent encoding for FR/IT names, mandatory fields that are sometimes null. Fetch real sample responses from parlament.ch, Zefix, and Lobbywatch before writing mock TypeScript types. Include "dirty" data in mock sets. Build a normalization layer between raw API and domain model.

5. **PostgreSQL traversal bottleneck for multi-hop queries** — 2-hop queries are fine; variable-depth "find all paths" queries degrade exponentially. Use WITH RECURSIVE CTEs, pre-compute common traversals as materialized views, index all FK columns, enforce a hard 3-hop maximum in the UI. Monitor with pg_stat_statements from day one.

## Implications for Roadmap

The architecture research provides an explicit build order based on technical dependencies. The pitfalls research identifies which decisions are load-bearing for later phases. Together they recommend a 6-phase structure with phases 1-4 (all UI work) proceeding on mock data in parallel with phase 5 (data ingestion pipelines).

### Phase 1: Foundation and Infrastructure

**Rationale:** Every other phase depends on this. The database schema, mock data system, and Next.js project setup must be stable before any feature work. Legal groundwork must be laid here — before real data is introduced — while mock data buys time. The progressive disclosure graph architecture decision also belongs here because retrofitting it is a rewrite.

**Delivers:** Working local development environment with realistic mock data; dark-mode design system; Supabase schema; Next.js App Router project.

**Implements:**
- Supabase project + actors/connections schema with traversal indexes
- Mock data seed script (faker/de_CH locale, realistic Swiss names, intentionally "dirty" data including FR/IT names and null fields)
- Next.js 16 + TypeScript + Tailwind 4 (dark-mode-first) + shadcn/ui
- Supabase client libraries (server + browser via `@supabase/ssr`)
- Core TypeScript types (actor, connection, source) informed by real API sample responses
- Abstraction layer design between external API shapes and internal domain model
- Legal consultation initiated (Swiss DSG DPIA assessment)
- Correction/deletion request workflow stub

**Avoids:** DSG personality profile violation (legal groundwork); graph hairball (progressive disclosure architecture decision); mock-to-real mismatch (API-informed type generation)

**Research flag:** Standard patterns — well-documented Supabase + Next.js integration. Skip phase research.

---

### Phase 2: Core Graph Visualization

**Rationale:** The interactive graph is the primary differentiator. Building it early with mock data validates the core UX, reveals graph hairball issues before they are expensive to fix, and unblocks all graph-adjacent features (filtering, shareable links, profile mini-graphs). Depends entirely on Phase 1 mock data.

**Delivers:** Working interactive network graph with ForceAtlas2 layout, progressive disclosure zoom levels, node/edge styling by type, hover tooltips, click-to-select.

**Implements:**
- `GraphContainer` with `next/dynamic(ssr: false)` boundary
- Graphology builder (DB rows → graph instance)
- Sigma.js WebGL rendering with ForceAtlas2 Web Worker
- Semantic zoom levels (party cluster → member list → politician connections)
- Node limit (50-80 visible) with progressive expand
- Node/edge coloring by actor type and party
- Hover tooltip (name + party + connection count)
- Click-to-navigate to profile page

**Avoids:** Graph hairball (progressive disclosure baked in); SVG anti-pattern (WebGL from day one); force-directed layout performance trap (Web Worker from day one)

**Research flag:** Needs phase research — graph progressive disclosure UX patterns and ForceAtlas2 tuning for political network aesthetics are nuanced. Recommend `/gsd:research-phase` before implementation.

---

### Phase 3: Navigation, Profiles, and Search

**Rationale:** Profile pages and search are table stakes that users expect. They also carry the SEO value — journalists share links to politician profiles, not to the graph. Depends on Phase 1 (schema, mock data) and partially Phase 2 (mini ego-graph on profile pages).

**Delivers:** Full politician and organization profile pages (SSR), global search with autocomplete, URL state encoding for all shareable views.

**Implements:**
- `/person/[slug]` and `/organization/[slug]` Server Components (SSR, structured data markup)
- Mini ego-graph on profile pages (client-only, `ssr: false`)
- Global search via Supabase full-text search (pg_trgm for fuzzy matching across DE/FR/IT names)
- nuqs URL state encoding (selected node, active filters, zoom level)
- Responsive design (mobile-usable profiles; graph desktop-only acceptable in v1)
- Data freshness indicators ("last updated" per data source)
- Source attribution on every connection (link + confidence level badge)

**Avoids:** UX jargon barrier (plain-language labels alongside technical terms); color blindness trap (party abbreviations alongside color); graph-only interface (table/list alternatives)

**Research flag:** Standard patterns for Next.js SSR profile pages and Supabase full-text search. Skip phase research.

---

### Phase 4: Filtering, Polish, and Graph Controls

**Rationale:** Filtering and graph controls complete the MVP. Without combinable filters, the graph is hard to navigate at full data scale. Shareable links require the URL state system from Phase 3 to be working. This phase polishes the experience to a shippable state.

**Delivers:** Full faceted filtering (party, canton, council, commission, connection type), graph legend, connection detail panel with source/confidence, shareable links for all states, dark-mode design system complete.

**Implements:**
- Filter panel: party, canton, council (NR/SR), commission, actor type, connection type — combinable
- Graph legend (node types, edge types, confidence levels)
- Connection detail panel (edge metadata, data source, confidence level, link to primary source)
- Shareable link generation and restoration from URL params
- OG image generation for profile pages (`/api/og/[type]/[slug]`)
- Accessibility: keyboard navigation via Radix UI primitives; table/list alternative for every graph view; screen reader tested

**Avoids:** Shareable link gaps (URL state covers every view state); missing list alternative (accessibility requirement); dense hover tooltips (show name + count on hover, full details on click)

**Research flag:** Standard patterns. Skip phase research.

---

### Phase 5: Data Ingestion Pipelines

**Rationale:** Can be developed in parallel with Phases 2-4 once the Phase 1 schema is stable. This is the only phase that requires real API integration. Should be built after the UI is proven with mock data so that the normalization layer is informed by actual frontend data requirements.

**Delivers:** Live data from parlament.ch, automated ingestion scheduling, data validation and logging.

**Implements:**
- parlament.ch ingestion Edge Function (OData API; evaluate both legacy and OpenParlData.ch; abstract both behind a common adapter)
- Normalization layer (raw API response → internal domain model; handles encoding, date formats, null coalescing)
- pg_cron scheduling (daily at 03:00 CET; pg_net HTTP triggers)
- Ingestion logging (source, timestamp, record count, error details)
- Zefix ingestion Edge Function (requires authentication via zefix@bj.admin.ch; exponential backoff; bulk import off-hours)
- Lobbywatch ingestion Edge Function (cross-validation source; handle Unix timestamps, `erfasst` boolean, FR/IT name encoding)
- Correction/deletion request workflow live (Art. 32 DSG compliance)
- Legal opinion confirmed before this phase goes to production

**Avoids:** Deprecated API coupling (abstraction layer); Zefix rate limiting (caching + off-hours batching); mock-to-real data mismatch (normalization layer); DSG violation (legal clearance required)

**Research flag:** Needs phase research — parlament.ch API landscape is actively shifting (old OData vs. OpenParlData.ch). Zefix authentication and rate limit patterns need validation. Recommend `/gsd:research-phase` before implementation.

---

### Phase 6: Advanced Features (v1.x and v2+)

**Rationale:** Delivered in sub-phases after core validation. Order within this phase should be determined by user feedback from Phases 1-5.

**Delivers (v1.x in priority order):**
- Zefix/Handelsregister cross-register integration (enables the full cross-register value proposition)
- Party-level and industry-level heatmaps (systemic journalist use case)
- Watchlist with email alerts (highest retention feature; TheyWorkForYou's most-used feature)
- Public REST/JSON API (researcher and developer audience)
- Data export (CSV, JSON, GraphML)
- Voting record display

**Delivers (v2+):**
- Conflict-of-interest scoring on votes (requires voting data + industry classification + auditable methodology)
- Campaign finance Sankey visualization (requires Eidg. Kanzlei data quality assessment first)
- AI natural language queries (Vercel AI SDK + Supabase Edge Functions as LLM gateway)
- Annotation/storytelling layer (requires journalist co-design)
- Lobbyregister integration
- Linked Open Data / SPARQL endpoint
- Cantonal parliament expansion

**Research flag:** Each v1.x and v2+ feature warrants individual phase research. Particularly: Eidg. Kanzlei data quality assessment before campaign finance work; LLM integration patterns before AI query work.

---

### Phase Ordering Rationale

- **Schema and mock data must precede all UI work** — the progressive disclosure architecture decision and API-informed type generation are Phase 1 load-bearing decisions.
- **Graph visualization precedes profiles/search** — the graph is the primary differentiator; validating it early with mock data reveals UX issues before they are expensive to fix.
- **Data ingestion is independent of the UI** — it can run in parallel with Phases 2-4 once the schema is stable, decoupling data pipeline timelines from frontend delivery.
- **Legal clearance gates real data ingestion** — the mock phase is legally safe; the transition to real data requires completed DPIA assessment.
- **Watchlist/alerts belongs in v1.x not v2+** — counter to intuition, this is one of the highest-impact retention features based on comparable platforms (TheyWorkForYou data). Build it before conflict-of-interest scoring.

### Research Flags Summary

**Needs `/gsd:research-phase` during planning:**
- **Phase 2 (Graph Visualization):** Progressive disclosure UX patterns for political networks; ForceAtlas2 parameter tuning for aesthetic political graph layouts; cognitive load thresholds for network graph complexity.
- **Phase 5 (Data Ingestion):** parlament.ch API landscape (legacy OData vs. OpenParlData.ch); Zefix authentication and undocumented rate limits; Eidg. Kanzlei data format and coverage gaps.
- **Phase 6 sub-phases (individually):** Campaign finance data quality; LLM integration patterns for civic data queries.

**Standard patterns — skip phase research:**
- **Phase 1 (Foundation):** Supabase + Next.js integration is extremely well-documented. Standard setup.
- **Phase 3 (Profiles/Search):** Next.js SSR Server Components and Supabase full-text search are well-documented. Standard patterns.
- **Phase 4 (Filtering/Polish):** URL state with nuqs, Radix UI accessibility, shadcn/ui components. All well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified via npm as of 2026-02-27. Compatibility matrix confirmed. Official sources throughout. |
| Features | MEDIUM | Competitor analysis based on 8+ live platforms. Swiss-specific features verified against Lobbywatch.ch and parlament.ch. AI features at LOW confidence — no comparable platform has implemented them as core. |
| Architecture | HIGH | Patterns well-documented. Supabase + Next.js integration officially supported. Sigma.js + Graphology architecture from official docs. PostgreSQL graph patterns from Supabase blog. |
| Pitfalls | MEDIUM-HIGH | DSG legal pitfall from official Swiss legal sources (PwC, Chambers, ICLG). Graph hairball from peer-reviewed cognitive load research. API pitfalls from practical migration experience. Open source sustainability from community data. |

**Overall confidence:** HIGH for the technical decisions. MEDIUM for product decisions (feature priority may shift based on user research with Swiss journalists and civic organizations).

### Gaps to Address

- **Zefix authentication:** Zefix requires a username/password requested via zefix@bj.admin.ch. Rate limits are undocumented. These are unknowns that must be resolved in Phase 5 research before implementation.
- **OpenParlData.ch coverage:** New REST API with uneven cantonal coverage. Federal data completeness (all 246 NR + 46 SR members with Interessenbindungen) must be verified before committing to it as primary source.
- **Eidg. Kanzlei campaign finance data quality:** Law is only since 2021. Early years have sparse, inconsistent data. Sankey visualization depends on this and should not be committed to without data quality assessment.
- **DSG DPIA scope:** Whether the platform's aggregation constitutes "high-risk profiling" requiring a formal DPIA (Art. 22 DSG) vs. a lower-level data processing assessment is a legal question requiring a Swiss data protection lawyer. This is the single highest-stakes uncertainty in the project.
- **Journalist user research:** Feature priority assumptions (especially for heatmaps, annotation layer, and AI queries) are based on analogous platforms. Validation with actual Swiss journalists and civic researchers would sharpen the v1.x roadmap.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 blog](https://nextjs.org/blog/next-16) / [16.1 blog](https://nextjs.org/blog/next-16-1) — Version, features, Turbopack stable
- [React 19.2 announcement](https://react.dev/blog/2025/10/01/react-19-2) — View Transitions, Activity component
- [Sigma.js official site](https://www.sigmajs.org/) — WebGL rendering performance
- [Graphology ForceAtlas2 docs](https://graphology.github.io/standard-library/layout-forceatlas2.html) — Web Worker, Barnes-Hut
- [Supabase changelog](https://supabase.com/changelog) + [npm](https://www.npmjs.com/package/@supabase/supabase-js) — PostgREST v14, SDK v2.97
- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — Official integration
- [Supabase Edge Functions + pg_cron](https://supabase.com/docs/guides/functions/schedule-functions) — Pipeline scheduling
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, build performance
- [Zod v4 release notes](https://zod.dev/v4) — Performance, @zod/mini
- [Parlament.ch Open Data](https://www.parlament.ch/en/services/open-data-webservices) — OData API
- [Zefix Public REST API Swagger](https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html) — Commercial register API
- [ICLG Swiss Data Protection 2025-2026](https://iclg.com/practice-areas/data-protection-laws-and-regulations/switzerland) — DSG overview
- [PwC: New Swiss FADP](https://www.pwc.ch/en/insights/fs/data-protection-switzerland.html) — Profiling and DPIA requirements
- [ArXiv: Scalability of Network Visualisation (Cognitive Load)](https://arxiv.org/abs/2008.07944) — Graph hairball research basis
- [PMC: Graph Visualization Efficiency](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/) — Library performance comparison
- [Next.js Lazy Loading / Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) — SSR-safe graph loading
- [Vitest 4.0 blog](https://vitest.dev/blog/vitest-4) — Browser Mode stable

### Secondary (MEDIUM confidence)
- [Lobbywatch.ch](https://lobbywatch.ch/de) + [API (GitHub)](https://github.com/lobbywatch/api) — Swiss lobbying data, API field documentation
- [Lobbywatch Data Interface Description](https://github.com/lobbywatch/lobbywatch/blob/master/drupal/lobbywatch/lobbywatch_data/data_interface_description.md) — Field-level API quirks
- [LittleSis](https://littlesis.org/toolkit) + [Oligrapher](https://github.com/public-accountability/oligrapher) — Network graph editor patterns
- [TheyWorkForYou](https://www.theyworkforyou.com/) — Alert system, voting analysis
- [OpenParlData.ch](https://opendata.ch/projects/openparldata/) + [Liip migration blog](https://www.liip.ch/en/blog/new-api-new-scope-new-mcp-server-upgrading-the-swiss-parliament-bot) — New parliamentary API, migration experience
- [Supabase: Postgres as Graph Database](https://supabase.com/blog/pgrouting-postgres-graph-database) — PostgreSQL graph patterns
- [Chambers: Data Protection Switzerland 2025](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2025/switzerland/trends-and-developments) — DSG enforcement trends
- [UC Berkeley: Election Data Visualization as Persuasion](https://www.ischool.berkeley.edu/news/2024/study-shows-election-data-visualization-design-can-be-powerful-persuasion-tool) — Visualization bias risks
- [OpenSSF: Open Infrastructure Sustainability](https://openssf.org/blog/2025/09/23/open-infrastructure-is-not-free-a-joint-statement-on-sustainable-stewardship/) — Open source sustainability risks

### Tertiary (LOW confidence)
- [OECD AI in Civic Participation (2025)](https://www.oecd.org/en/publications/2025/06/governing-with-artificial-intelligence_398fa287/full-report/ai-in-civic-participation-and-open-government_51227ce7.html) — AI features in civic tech (experimental)
- [Zustand vs. Jotai comparison](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025) — State management selection
- [Open Source Maintainer Burnout Statistics](https://byteiota.com/open-source-maintainer-crisis-60-unpaid-burnout-hits-44/) — 60% unpaid, 44% burnout rate

---
*Research completed: 2026-02-27*
*Ready for roadmap: yes*
