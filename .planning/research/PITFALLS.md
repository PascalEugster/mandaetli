# Pitfalls Research

**Domain:** Swiss political transparency platform with network graph visualization
**Researched:** 2026-02-27
**Confidence:** MEDIUM-HIGH (verified against official sources, Swiss legal documentation, and domain-specific case studies)

## Critical Pitfalls

### Pitfall 1: Data Aggregation Creates a Legal "Personality Profile" Under the DSG

**What goes wrong:**
The platform's core value proposition -- cross-referencing parlament.ch, Zefix, Lobbyregister, and Lobbywatch data into a unified network -- legally constitutes "profiling" or even "personality profile creation" under the revised Swiss Federal Act on Data Protection (nFADP/DSG, effective 1 September 2023). Even though each data source is individually public, aggregating them into a connected profile of a politician changes the legal classification of the processing. Under Art. 5 lit. f and g DSG, high-risk profiling and personality profiles require express consent, and penalties reach CHF 250,000 imposed on responsible individuals (not the organization).

**Why it happens:**
Developers assume "public data = free to use however you want." The DSG has no blanket exemption for publicly available data. Purpose limitation (Art. 6 para. 3 DSG) applies: data collected for one purpose (e.g., commercial register transparency) may not automatically be repurposed (e.g., creating politician profiles). The moment you aggregate across sources, you are creating new information that did not exist in any single register.

**How to avoid:**
- Obtain a legal opinion from a Swiss data protection lawyer before launch -- specifically on whether the platform's aggregation constitutes high-risk profiling under Art. 22 DSG, requiring a Data Protection Impact Assessment (DPIA).
- Limit aggregation to what is strictly necessary for the stated transparency purpose. Do not speculatively combine data.
- Implement a clear legal basis page on the site explaining the public interest justification (Art. 31 DSG allows processing for public interest purposes, including journalism and democratic transparency).
- Build a correction/deletion request workflow from day one -- politicians can request corrections under Art. 32 DSG.
- Never store or display data beyond what is officially declared in the source registers.
- Consider whether the "AI-inferred" confidence level for connections crosses a line into automated profiling that requires DPIA.

**Warning signs:**
- You are combining more than two data sources for a single person without having consulted a lawyer.
- You have an "AI-inferred" label on connections but no DPIA for the AI processing.
- You have no published privacy policy or legal basis explanation.
- A politician or their counsel sends a deletion/correction request and you have no process to handle it.

**Phase to address:**
Phase 1 (Foundation). Legal groundwork must be laid before any real data is ingested. Mock data phase is safe, but the legal framework must be ready before the mock-to-real transition.

---

### Pitfall 2: The parlament.ch API Landscape Is Shifting -- Building on the Wrong API

**What goes wrong:**
The historic parlament.ch OData API (ws-old.parlament.ch) was unofficial, had quirks, was sometimes slow, and is being superseded. Developers build ingestion pipelines against this old API, only to discover it is deprecated or unreliable. Meanwhile, OpenParlData.ch has emerged as a new REST-based API covering federal, cantonal, and municipal parliaments -- but with uneven data coverage across cantons and some queries returning empty results because the data is not yet available.

**Why it happens:**
Most existing code examples, StackOverflow answers, and libraries (e.g., the swissparl R package) reference the old OData endpoint. Developers find these first and build against them. The 26 cantonal parliaments, 461 municipal parliaments, and the federal parliament publish data in different formats, structures, and qualities.

**How to avoid:**
- Start with the official parlament.ch Open Data page (parlament.ch/en/services/open-data-webservices) and evaluate both the legacy OData endpoint and the OpenParlData.ch REST API.
- Design an abstraction layer between your data ingestion and your data model. Never couple your domain model directly to the API response shape.
- Test API endpoints for completeness before committing. Query for all 246 National Council members and verify the Interessenbindungen data is present and structured consistently.
- Plan for dual-source ingestion: use Lobbywatch.ch as a cross-validation source (their data is pre-processed and manually curated by the NGO).
- Cache aggressively. Swiss parliamentary data changes infrequently (legislature cycles), so there is no need for real-time polling.

**Warning signs:**
- You are hitting ws-old.parlament.ch in your code.
- Your data ingestion returns fewer than 246 National Council members or 46 Council of States members.
- Interessenbindungen fields are inconsistently structured across members.
- You have no fallback data source if the primary API is down or returns incomplete data.

**Phase to address:**
Phase 2 (Data Ingestion). But the abstraction layer design belongs in Phase 1 architecture decisions.

---

### Pitfall 3: Network Graph Becomes an Unreadable "Hairball" at Real Data Scale

**What goes wrong:**
The graph looks beautiful with 20-30 mock nodes. When 246 politicians are loaded, each with 5-20 declared interests connecting to hundreds of organizations, the visualization collapses into an unreadable mess. Research shows people have significant difficulty finding shortest paths in node-link diagrams with more than 50 nodes even at low density. At extreme complexity, cognitive load research shows users literally give up and disengage.

**Why it happens:**
Mock data is clean and sparse. Real data has power-law distributions: a few politicians hold 15+ Verwaltungsratsmandate while most have 3-5. Some organizations (banks, insurance companies, industry associations) connect to dozens of politicians, creating dense hub nodes. The "hairball" effect is well-documented in network visualization research -- even the best layout algorithms produce it beyond a certain complexity threshold.

**How to avoid:**
- Design for progressive disclosure from day one. The default view should NEVER show all 246 politicians simultaneously. Start with a search, a party filter, or a single politician and expand outward.
- Implement semantic zoom levels: overview (party clusters only) -> party detail (members listed) -> politician detail (their connections) -> connection detail (specific board mandate).
- Use node clustering/aggregation: group organizations by sector (finance, pharma, energy, etc.) and expand on click.
- Set hard limits on visible nodes (50-80 maximum visible at once) and implement "show more" expansion.
- Use Sigma.js with WebGL rendering (not D3 SVG) -- Sigma.js handles 10,000 nodes via GPU rendering, while SVG-based D3 chokes at a few hundred.
- Implement edge bundling or edge filtering (show only edges above a certain weight/importance).

**Warning signs:**
- Your mock data has fewer than 50 nodes and you have not tested with 500+.
- There is no zoom-level-dependent rendering logic in your graph component.
- All nodes and edges are rendered simultaneously regardless of viewport.
- You are using SVG rendering for the graph.
- User testing shows people cannot find a specific politician within 10 seconds.

**Phase to address:**
Phase 1 (Mock Data + UI). The progressive disclosure architecture must be built into the mock data phase because retrofitting it onto a "show everything" graph is a rewrite.

---

### Pitfall 4: Mock Data Shapes Do Not Match Real API Response Structures

**What goes wrong:**
The team builds a complete, polished UI against idealized mock data with consistent field names, predictable nesting, no null values, and clean Swiss-German names. When real APIs are connected, everything breaks: parlament.ch returns different field names than expected, Zefix uses different entity identifiers, Lobbywatch has Unix timestamps where dates were expected, organization names have inconsistent encoding (umlauts, accents for French/Italian names), and mandatory fields are sometimes null.

**Why it happens:**
Mock data is designed to make the frontend work, not to simulate the real API's warts. The Lobbywatch API documentation explicitly notes that "fields ending with *_unix contain the date in the UNIX date format" and that the "erfasst" field being false means data is not yet entered. These edge cases are invisible in mock data. Additionally, Swiss political data spans three languages (DE/FR/IT), and name encoding issues are endemic.

**How to avoid:**
- Before writing mock data, fetch real sample responses from each API and use those as the mock data shape. Use actual field names from parlament.ch, Zefix, and Lobbywatch.
- Define TypeScript interfaces from real API responses, not from wishful thinking. Generate types from Swagger/OpenAPI specs where available (Zefix has one).
- Include "dirty" data in mock data: null fields, missing Interessenbindungen, organizations with only French names, duplicate entities with slightly different names.
- Build a normalization layer between raw API data and your domain model. This layer handles encoding, date formats, null coalescing, and entity deduplication.
- Write integration tests that run against real API endpoints (in CI, with caching) to catch schema drift early.

**Warning signs:**
- Mock data TypeScript types were hand-written without consulting real API docs.
- Mock data has zero null values.
- No normalization/transformation layer exists between API fetch and domain model.
- All mock politician names are German with no French or Italian names.
- You have not made a single real API call during the mock data phase.

**Phase to address:**
Phase 1 (Mock Data Design) and Phase 2 (Data Integration). The mock data shapes must be informed by real API exploration in Phase 1, even though full integration happens in Phase 2.

---

### Pitfall 5: PostgreSQL Becomes a Bottleneck for Multi-Hop Relationship Queries

**What goes wrong:**
The project chose Supabase (PostgreSQL) over Neo4j for good reasons (auth, storage, real-time, API in one package). But network traversal queries -- "show me all politicians connected to Company X through any intermediary" (2-hop) or "find the shortest path between Politician A and Organization B" (variable-hop) -- degrade exponentially with JOINs in relational databases. A 3-hop query across 246 politicians with thousands of connections can take seconds instead of milliseconds.

**Why it happens:**
Relational databases resolve relationships at query time through JOIN operations and index lookups. Graph databases pre-materialize relationships as physical connections, making traversal O(1) per hop. At the scale of Swiss federal politics (~246 politicians, ~2000 organizations, ~5000+ connections), 1-2 hop queries are fine in PostgreSQL, but variable-depth traversals and "find all paths" queries hit a wall.

**How to avoid:**
- Use PostgreSQL recursive CTEs (WITH RECURSIVE) for traversal queries. Supabase supports these natively and they handle 2-3 hops adequately at this scale.
- Pre-compute common traversals: materialize "politician -> organization -> connected politicians" as a view or materialized view that refreshes on data updates (which are infrequent -- legislature cycles).
- Index all foreign keys in relationship tables. Use composite indexes on (source_id, target_id) pairs.
- Set a hard maximum traversal depth (3 hops). The UI should not allow arbitrary-depth exploration -- it is not useful and is computationally expensive.
- Monitor query performance from day one using pg_stat_statements (enabled by default in Supabase).
- Keep Neo4j as a documented escape hatch. If the graph grows beyond federal politics (cantonal, municipal), a graph database may become necessary.

**Warning signs:**
- Recursive CTE queries take longer than 200ms for 2-hop traversals.
- You are building "find all paths" features without a depth limit.
- The relationships table has no indexes on foreign key columns.
- You are running graph traversal queries on every page load instead of using pre-computed results.

**Phase to address:**
Phase 1 (Schema Design) and Phase 3 (Performance Optimization). The schema must support efficient traversal from the start; optimization and materialized views can come later.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded mock data in components | Fast UI prototyping | Painful to extract when switching to real APIs, components coupled to data shape | Only in Phase 1, with strict extraction deadline |
| Skipping the normalization layer | Directly map API responses to UI | Every API change breaks the frontend, entity deduplication impossible | Never -- build the normalization layer even for mock data |
| Single-language mock data (DE only) | Faster mock data creation | FR/IT data breaks the UI on integration, layout assumptions fail with longer French strings | Phase 1 only, but include at least 10% FR/IT names |
| No caching layer for external APIs | Simpler architecture | Rate limiting from Zefix/parlament.ch, slow page loads, unnecessary API load | Never for production; acceptable in development |
| SVG graph rendering for simplicity | Easier to style and debug | Rewrite to WebGL when performance degrades past 100 nodes | Never -- start with Sigma.js WebGL from Phase 1 |
| Storing raw API responses without normalization | Faster initial data import | Schema changes upstream break everything, no consistent query interface | Only as a staging/raw layer alongside a normalized layer |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **parlament.ch** | Using the deprecated ws-old.parlament.ch OData endpoint | Evaluate OpenParlData.ch REST API; build abstraction layer supporting both; validate Interessenbindungen completeness for all 246 members |
| **Zefix** | Assuming unlimited free queries; not handling authentication | Zefix requires username/password authentication (request via zefix@bj.admin.ch). Rate limits are undocumented -- implement exponential backoff and local caching. Bulk import during off-hours |
| **Lobbywatch.ch** | Treating it as a primary source instead of cross-validation | Lobbywatch is an NGO with manually curated data -- valuable but not authoritative. Use it to validate parlament.ch data, not replace it. Their API uses non-standard date formats (Unix timestamps) and has a "erfasst" boolean indicating data completeness |
| **Lobbyregister** | Expecting a well-structured API | Available via opendata.swiss as data dumps, not a queryable API. Plan for periodic file import, not real-time queries |
| **Eidg. Kanzlei (campaign finance)** | Expecting structured data since 2021 | Campaign finance transparency is new (post-2021 referendum). Data coverage is sparse for early years. Expect significant gaps and format inconsistencies |
| **Supabase Auth** | Building custom auth before evaluating if you need it | For Phase 1-3, you likely do not need user auth at all (public platform). Defer auth to when watchlist/alerts features require it |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all graph nodes at once | Page freezes on load, 2+ second render time, mobile users see blank screen | Progressive disclosure, viewport-based rendering, max 50-80 visible nodes | Beyond 100 nodes with SVG; beyond 5,000 nodes with WebGL if using icon-based rendering |
| Full graph data sent to client on every page load | Large initial page payload (1MB+), slow Time to Interactive | Send only visible subgraph; lazy-load connections on expand; use server-side graph queries | Beyond 500 nodes/2000 edges in the JSON payload |
| Unindexed foreign keys in relationship tables | Slow queries, page load times increase linearly with data growth | Add indexes on all FK columns and composite indexes on (source_type, source_id, target_type, target_id) | Beyond 10,000 relationship rows |
| Force-directed layout computed on every render | CPU spins, fan noise, battery drain on laptops | Pre-compute layout server-side or cache layout positions; only recompute on data change | Beyond 200 nodes with force-directed in the browser |
| No API response caching | Redundant calls to external APIs, rate limiting, slow cold starts | HTTP cache headers, local DB cache of API responses, background refresh jobs | The first time two users request the same politician within a minute |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Zefix API credentials in client-side code | API credentials leaked, account potentially revoked | All external API calls must go through server-side routes (Next.js API routes or Supabase Edge Functions). Never embed credentials in frontend bundles |
| No input sanitization on search queries | SQL injection via Supabase; XSS via graph labels rendered in WebGL overlay or HTML tooltips | Use Supabase's parameterized queries exclusively; sanitize all user input before rendering in tooltips/labels; CSP headers |
| Serving politician data without rate limiting your own API | Scraping, abuse, cost escalation on Supabase | Implement rate limiting on public API endpoints from day one (use Supabase Edge Functions or Vercel edge middleware) |
| Storing more data than legally necessary | DSG violation, increased liability surface | Data minimization: store only what is needed for the stated purpose. Implement data retention policies. Do not archive deleted/corrected records without legal basis |
| Missing HTTPS or insecure cookie handling | Data interception, session hijacking | Enforce HTTPS everywhere (Vercel does this by default). Use secure, httpOnly, sameSite cookies if auth is implemented |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing the full network graph as the landing page | Overwhelming, meaningless without context, users leave within seconds | Land on search or curated entry points ("Most connected politicians", "Search by name or party"). Graph is the exploration tool, not the front door |
| No clear explanation of what connections mean | Users misinterpret "connection" as "corruption" | Every edge must show its type (Verwaltungsrat, Interessenbindung, Lobbymandat) and source. Add an onboarding tooltip explaining connection types |
| Graph-only interface with no list/table alternative | Accessibility failure, screen reader incompatible, mobile unusable | Provide list/table views as equal alternatives to the graph. The graph is a visualization layer on top of structured data, not the only way to access it |
| Assuming users understand Swiss political jargon | Non-experts (and non-German speakers) are alienated | Translate Interessenbindungen to "declared interests", Verwaltungsratsmandat to "board mandate", etc. Progressive disclosure: simple label first, technical term on hover |
| Using color to encode political party without considering color blindness | ~8% of male users cannot distinguish red/green party colors | Use party abbreviation labels alongside color; ensure sufficient contrast; test with color blindness simulators |
| Dense tooltips with all data fields on hover | Information overload on every mouse movement | Show name + party + connection count on hover. Full details on click/profile page |

## "Looks Done But Isn't" Checklist

- [ ] **Graph visualization:** Looks great with 30 mock nodes -- test with 300+ nodes including hub nodes (UBS, Credit Suisse) with 20+ connections each
- [ ] **Search:** Works for exact German names -- test with partial matches, French/Italian names, umlauts (Muller vs Mueller vs Mueller), and names with particles (von, de)
- [ ] **Profile pages:** Display all fields for mock data -- verify handling of null/missing Interessenbindungen, politicians who left office mid-term, organizations that were dissolved
- [ ] **Shareable links:** URL encodes the view correctly -- test with deep graph states, filtered views, and special characters in entity names
- [ ] **Data sources display:** Shows source for mock connections -- verify that every real connection traces back to a specific API endpoint and date of retrieval
- [ ] **Responsive design:** Graph renders on mobile -- verify touch interactions (pinch zoom, tap to select, drag to pan) work correctly and that the graph is usable, not just visible
- [ ] **Legal compliance:** Privacy policy exists -- verify DPIA is completed, correction/deletion process is functional, and all data sources are correctly attributed
- [ ] **Performance:** Fast on developer's MacBook Pro -- test on a 3-year-old Android phone on 3G, which is how many Swiss citizens will access it
- [ ] **Multilingual data:** German names display correctly -- verify French (e.g., "Societe de Banque Suisse") and Italian (e.g., "Consiglio di Stato") names render without encoding issues

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| DSG personality profile violation | HIGH | Engage Swiss data protection lawyer immediately. File voluntary report with FDPIC. Implement DPIA retroactively. May need to remove aggregated data temporarily |
| Built on deprecated parlament.ch API | MEDIUM | If abstraction layer exists: swap API adapter. If coupled: significant refactor of data ingestion pipeline. Use Lobbywatch as interim data source |
| Hairball graph at scale | HIGH | Requires rearchitecting the graph component with progressive disclosure, zoom levels, and clustering. Cannot be patched onto a "show all" implementation -- it is a rewrite |
| Mock-to-real data mismatch | MEDIUM | Build normalization layer retroactively. Map real fields to expected fields. Write migration scripts for stored mock data. Time-consuming but straightforward |
| PostgreSQL traversal bottleneck | MEDIUM | Add materialized views for common traversals. If insufficient: add Neo4j as a read-replica for graph queries while keeping Supabase for everything else. Dual-database adds operational complexity |
| Open source project abandonment | HIGH | If sole maintainer burns out with no documentation, project effectively dies. Recovery requires new maintainer onboarding from scratch. Prevention is the only viable strategy |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| DSG personality profile creation | Phase 1 (Foundation) | Legal opinion obtained and documented before any real data ingestion |
| Building on deprecated API | Phase 1 (Architecture) | Abstraction layer tested against both old and new API endpoints |
| Graph hairball at scale | Phase 1 (UI/Mock Data) | Load test with 300+ realistic nodes; user can find specific politician in <10 seconds |
| Mock-to-real data mismatch | Phase 1 (Mock Data Design) | Mock data TypeScript types generated from real API sample responses |
| PostgreSQL traversal bottleneck | Phase 1 (Schema) + Phase 3 (Optimization) | 2-hop queries return in <200ms with production-scale data |
| Force-directed layout performance | Phase 1 (Graph Architecture) | Layout pre-computed or cached; no CPU spike on graph load |
| Zefix rate limiting | Phase 2 (Data Ingestion) | Caching layer verified; bulk import tested without triggering throttling |
| Missing multilingual support | Phase 1 (Mock Data) | Mock data includes DE/FR/IT names; UI renders all correctly |
| No correction/deletion process | Phase 2 (Before public launch) | End-to-end test: submit correction, verify it is processed, verify UI updates |
| Open source sustainability | Phase 1 (Governance) | CONTRIBUTING.md, governance model, and bus factor >1 documented before public launch |
| UX jargon barrier | Phase 1 (Design) | User test with non-expert who can explain what they see within 30 seconds |
| Graph accessibility | Phase 1 (Design) | Table/list alternative exists for every graph view; screen reader tested |

## Sources

- [Swiss Parliament Open Data/Webservices](https://www.parlament.ch/en/services/open-data-webservices) -- Official data services page
- [OpenParlData.ch](https://opendata.ch/projects/openparldata/) -- New harmonized parliamentary data API
- [Liip Blog: New OpenData API](https://www.liip.ch/en/blog/new-api-new-scope-new-mcp-server-upgrading-the-swiss-parliament-bot) -- Practical migration experience from old to new API (MEDIUM confidence)
- [Zefix PublicREST API](https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html) -- Official Swagger documentation
- [Lobbywatch API](https://github.com/lobbywatch/api) -- Lobbywatch data API documentation
- [Lobbywatch Data Interface Description](https://github.com/lobbywatch/lobbywatch/blob/master/drupal/lobbywatch/lobbywatch_data/data_interface_description.md) -- Field-level API documentation
- [ICLG: Swiss Data Protection Laws 2025-2026](https://iclg.com/practice-areas/data-protection-laws-and-regulations/switzerland) -- Comprehensive DSG/FADP overview (HIGH confidence)
- [Chambers: Data Protection Switzerland 2025](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2025/switzerland/trends-and-developments) -- DSG enforcement trends
- [PwC: New Swiss FADP - 5 Changes](https://www.pwc.ch/en/insights/fs/data-protection-switzerland.html) -- Profiling and DPIA requirements (HIGH confidence)
- [PMC: Graph Visualization Efficiency](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/) -- Comparative performance study of graph libraries (HIGH confidence)
- [ArXiv: Scalability of Network Visualisation from a Cognitive Load Perspective](https://arxiv.org/abs/2008.07944) -- Research on cognitive limits of graph visualization (HIGH confidence)
- [Sigma.js](https://www.sigmajs.org/) -- Official documentation for recommended graph library
- [Sigma.js GitHub Issue #239](https://github.com/jacomyal/sigma.js/issues/239) -- Performance discussion for 5000+ nodes
- [Supabase: PostgreSQL Recursive CTEs](https://dev.to/roel_peters_8b77a70a08fdb/beyond-flat-tables-model-hierarchical-data-in-supabase-with-recursive-queries-4ndl) -- Hierarchical data in Supabase (MEDIUM confidence)
- [Supabase Blog: Postgres as Graph Database](https://supabase.com/blog/pgrouting-postgres-graph-database) -- pgRouting for graph queries in PostgreSQL
- [OpenSSF: Open Infrastructure Sustainability](https://openssf.org/blog/2025/09/23/open-infrastructure-is-not-free-a-joint-statement-on-sustainable-stewardship/) -- Open source sustainability crisis (HIGH confidence)
- [Open Source Maintainer Burnout Statistics](https://byteiota.com/open-source-maintainer-crisis-60-unpaid-burnout-hits-44/) -- 60% unpaid, 44% burnout rate (MEDIUM confidence)
- [Toptal: Data Visualization Mistakes](https://www.toptal.com/designers/ux/data-visualization-mistakes) -- Common UX failures in data visualization
- [UC Berkeley: Election Data Visualization as Persuasion](https://www.ischool.berkeley.edu/news/2024/study-shows-election-data-visualization-design-can-be-powerful-persuasion-tool) -- Bias risks in political data visualization (HIGH confidence)

---
*Pitfalls research for: Seilschaften.ch -- Swiss political transparency platform*
*Researched: 2026-02-27*
