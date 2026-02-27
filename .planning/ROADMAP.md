# Roadmap: Seilschaften.ch

## Overview

Seilschaften.ch delivers a public transparency platform that visualizes connections between Swiss politicians and economic interests. The build follows a mock-data-first strategy: Phase 1 establishes the full data foundation and design system with realistic mock data, Phase 2 builds the interactive network graph (the primary differentiator), Phase 3 adds profile pages and search (the SEO and shareability backbone), Phase 4 completes the experience with filtering, sharing, and responsive polish, and Phase 5 adds the watchlist/alerts retention feature. Real API integration is deferred to post-v1 -- the entire v1 ships on mock data to decouple UI development from external API timelines.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Mock Data** - Database schema, realistic mock data for all Swiss political actors, and dark-mode design system
- [ ] **Phase 2: Network Graph Visualization** - Interactive WebGL force-directed graph with progressive disclosure and basic controls
- [ ] **Phase 3: Profiles and Search** - SSR politician/organization/party profile pages with global search and autocomplete
- [ ] **Phase 4: Sharing, Filtering, and Polish** - Shareable URLs, advanced filtering, responsive design, and progressive disclosure across all views
- [ ] **Phase 5: Watchlist and Alerts** - Email-based watchlist for tracking politicians and organizations with change notifications

## Phase Details

### Phase 1: Foundation and Mock Data
**Goal**: A developer can run the project locally and browse realistic Swiss political data through the database and basic UI shell with the dark-mode design system applied
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts a Next.js application that displays a dark-mode landing page with Swiss red accents and the project's navigation shell
  2. The Supabase database contains 246 realistic council members, ~500 organizations/companies, ~50 parties, and mock voting records -- all with multilingual names, nullable fields, and Swiss-locale formatting
  3. Every connection in the mock data has a source attribution (register name, URL, date) and a confidence level badge (verified, declared, media-reported, or inferred)
  4. Data freshness timestamps are visible per data source, showing when each source was last synced
  5. TypeScript types for actors, connections, and sources compile cleanly and reflect real Swiss API response structures (including intentionally "dirty" data patterns)
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD
- [ ] 01-03: TBD

### Phase 2: Network Graph Visualization
**Goal**: Users can explore the Swiss political network through an interactive force-directed graph that stays readable at full data scale through progressive disclosure
**Depends on**: Phase 1
**Requirements**: GRAPH-01, GRAPH-02, GRAPH-03, GRAPH-04, GRAPH-05, GRAPH-06, GRAPH-07, GRAPH-08, GRAPH-09, GRAPH-10
**Success Criteria** (what must be TRUE):
  1. The network graph renders all 246+ politicians and their connections via WebGL without frame drops, with ForceAtlas2 layout computing in a Web Worker
  2. User can zoom from party-cluster overview to individual politician nodes to connection details (semantic zoom levels), with never more than ~50-80 nodes visible at once
  3. User can filter the graph by party, canton, council (NR/SR), and industry sector -- filters combine and update the graph in real time
  4. User can search for a specific actor within the graph and the matching node highlights and centers; user can select two actors and see all paths between them highlighted
  5. Clicking a node navigates to that actor's profile page; hovering shows name, party, and connection count; clicking an edge shows connection type (Verwaltungsrat, Beirat, etc.)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Profiles and Search
**Goal**: Journalists and researchers can find any politician or organization via search and view a complete profile page with all connections, voting records, and conflict-of-interest analysis -- all linkable for sharing
**Depends on**: Phase 1, Phase 2 (for mini ego-graphs on profile pages)
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, PROF-07, PROF-08, PROF-09, PROF-10, SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05
**Success Criteria** (what must be TRUE):
  1. A politician profile page at `/person/[slug]` renders server-side with name, photo, party, canton, council, commissions, election date, all declared Interessenbindungen with source links, voting record, and conflict-of-interest score with transparent methodology
  2. An organization profile page at `/organization/[slug]` lists all connected politicians with their roles and shows a mini network graph of that organization's connections
  3. A party profile page displays all members, aggregate connection statistics, top connected industries, and an industry/branch heatmap across parties
  4. Global search bar returns instant autocomplete results grouped by actor type (politician, organization, party) with relevance ranking and filters for party, canton, council, and actor type
  5. All list views (members, connections, search results) support sorting by name, connection count, party, and canton; a persistent navigation structure lets users move between all sections of the platform
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Sharing, Filtering, and Polish
**Goal**: Every view in the platform has a unique shareable URL, the design system is complete with progressive disclosure and responsive layouts, and the platform is usable on mobile
**Depends on**: Phase 2, Phase 3
**Requirements**: DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, SHAR-01, SHAR-02, SHAR-03, SHAR-04
**Success Criteria** (what must be TRUE):
  1. Every profile page, search result, graph state, and filtered view has a unique URL that, when opened in a new browser, restores the exact same view (including graph filters, selected node, and zoom level via nuqs)
  2. Sharing a profile link on social media generates an OG preview card with actor name, photo, and connection summary; a "copy link" button is accessible from every view
  3. Progressive disclosure is implemented across all views: overview shows summary, clicking reveals detail, detail links to raw data/sources; every numeric value shows its source on hover
  4. Confidence level badges are consistently visible on all connections and data points across the entire platform
  5. Profile pages, search, and list views are fully usable on mobile; the graph view shows an appropriate mobile alternative (simplified list/card view) on small screens
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Watchlist and Alerts
**Goal**: Users can track politicians and organizations they care about and get notified when something changes, without needing an account
**Depends on**: Phase 3
**Requirements**: WATCH-01, WATCH-02, WATCH-03, WATCH-04
**Success Criteria** (what must be TRUE):
  1. User can add any politician or organization to a watchlist by entering only their email address -- no account creation required
  2. When new connections are detected for a watched actor, the user receives an email notification describing the change
  3. Every notification email contains a link to manage the watchlist (add/remove actors), so the user never needs to remember a URL or create an account
  4. Watchlist storage collects only the email address and watched actor IDs -- no additional personal data, fully DSG-compliant
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Mock Data | 0/3 | Not started | - |
| 2. Network Graph Visualization | 0/3 | Not started | - |
| 3. Profiles and Search | 0/3 | Not started | - |
| 4. Sharing, Filtering, and Polish | 0/2 | Not started | - |
| 5. Watchlist and Alerts | 0/1 | Not started | - |
