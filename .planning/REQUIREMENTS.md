# Requirements: Mandaetli.ch

**Defined:** 2026-02-27
**Core Value:** Any Swiss citizen can find and understand the economic connections behind any National Council member in under 2 minutes — and share that finding via a link.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Foundation

- [ ] **DATA-01**: Database schema models political actors (politicians, parties, organizations, companies) as typed nodes with metadata
- [ ] **DATA-02**: Database schema models connections between actors with type, strength, source reference, and confidence level
- [ ] **DATA-03**: Mock data system seeds 246 realistic National Council and Council of States members with party, canton, photo, and commission memberships
- [ ] **DATA-04**: Mock data includes ~500 organizations/companies with realistic Interessenbindungen connections to politicians
- [ ] **DATA-05**: Mock data includes ~50 realistic party entries with metadata (seats, ideology positioning)
- [ ] **DATA-06**: Mock data shapes mirror real Swiss API response structures (multilingual names, nullable fields, Swiss date formats)
- [ ] **DATA-07**: Every connection in the system has a source attribution (register name, URL, retrieval date)
- [ ] **DATA-08**: Every connection displays a confidence level (verified, declared, media-reported, inferred)
- [ ] **DATA-09**: Data freshness indicators show last-updated timestamps per data source and per entity
- [ ] **DATA-10**: Mock voting records for politicians across realistic parliamentary votes (Nationalrat/Ständerat sessions)

### Network Graph

- [ ] **GRAPH-01**: Interactive force-directed network graph renders all actors and connections using WebGL (Sigma.js + Graphology)
- [ ] **GRAPH-02**: User can zoom and pan the graph smoothly with mouse/trackpad
- [ ] **GRAPH-03**: User can click any node to open that actor's profile without leaving the graph view
- [ ] **GRAPH-04**: Graph implements progressive disclosure with semantic zoom levels (overview clusters → individual nodes → connection details)
- [ ] **GRAPH-05**: User can filter the graph by party, canton, council (National/Ständerat), and industry sector
- [ ] **GRAPH-06**: User can search within the graph to find and highlight a specific actor
- [ ] **GRAPH-07**: User can highlight all paths between two selected actors
- [ ] **GRAPH-08**: Nodes are visually differentiated by actor type (politician, party, organization, company) with distinct shapes/colors
- [ ] **GRAPH-09**: Connection edges display type (Verwaltungsrat, Beirat, Stiftungsrat, Lobbyist, etc.) on hover/click
- [ ] **GRAPH-10**: Graph layout computes via ForceAtlas2 in a Web Worker to keep UI responsive

### Profiles

- [ ] **PROF-01**: Politician profile page displays name, photo, party, canton, council, commission memberships, and election date
- [ ] **PROF-02**: Politician profile page lists all declared Interessenbindungen with organization name, role, compensation status, and source link
- [ ] **PROF-03**: Politician profile page shows a mini network graph of that politician's direct connections
- [ ] **PROF-04**: Organization/company profile page displays all connected politicians with their roles
- [ ] **PROF-05**: Organization profile page shows a mini network graph of that organization's connections
- [ ] **PROF-06**: Party profile page displays all members, aggregate connection statistics, and top connected industries
- [ ] **PROF-07**: Industry/branch heatmap shows which industries are most represented across which parties
- [ ] **PROF-08**: Politician profile page displays voting record with vote topic, date, and position (yes/no/abstain/absent)
- [ ] **PROF-09**: Politician profile page displays a conflict-of-interest score — how often they voted in areas where they hold economic interests
- [ ] **PROF-10**: Conflict-of-interest methodology is fully transparent and accessible from any score display

### Search & Navigation

- [ ] **SRCH-01**: Global search bar searches across all actors (politicians, organizations, parties) with instant autocomplete
- [ ] **SRCH-02**: Search results are grouped by actor type with relevance ranking
- [ ] **SRCH-03**: User can filter results by party, canton, council, and actor type
- [ ] **SRCH-04**: User can navigate the full platform from a persistent navigation structure
- [ ] **SRCH-05**: All list views support sorting (alphabetical, by connection count, by party, by canton)

### Design System

- [ ] **DSGN-01**: Dark-mode-first design with deep dark blue/anthracite background as default
- [ ] **DSGN-02**: Swiss red (#FF0000) used as the sole accent color throughout the platform
- [ ] **DSGN-03**: Clean, sans-serif alpine typography optimized for data-dense layouts
- [ ] **DSGN-04**: Progressive disclosure pattern implemented across all views (overview → detail → raw data)
- [ ] **DSGN-05**: Every numeric value shows its source on hover (tooltip with register name and link)
- [ ] **DSGN-06**: Confidence level badges are visible on all connections and data points
- [ ] **DSGN-07**: Responsive design — profile pages, search, and list views are fully usable on mobile
- [ ] **DSGN-08**: Graph view displays a mobile-appropriate alternative (simplified list/card view) on small screens

### Sharing & URLs

- [ ] **SHAR-01**: Every profile page, search result, graph state, and filtered view has a unique shareable URL
- [ ] **SHAR-02**: URL state captures graph filters, selected node, zoom level, and active view via nuqs
- [ ] **SHAR-03**: OG meta tags generate social sharing previews with actor name, photo, and connection summary
- [ ] **SHAR-04**: User can copy a share link with one click from any view

### Watchlist & Alerts

- [ ] **WATCH-01**: User can add any politician or organization to a personal watchlist (email-based, no account required)
- [ ] **WATCH-02**: User receives email notification when new connections are detected for watched actors
- [ ] **WATCH-03**: User can manage their watchlist (add/remove actors) via a link in notification emails
- [ ] **WATCH-04**: Watchlist data is stored with email address only — minimal data collection, DSG-compliant

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Campaign Finance

- **FIN-01**: Campaign finance data integrated from Eidgenössische Kanzlei (Abstimmungskomitees, donations since 2021)
- **FIN-02**: Sankey diagram visualizes money flows from donors through committees to votes
- **FIN-03**: "Follow the Money" view per vote — who donated, which connected parliamentarians voted how

### AI Analysis

- **AI-01**: Claude-powered natural language queries ("Which Nationalräte have connections to pharma companies?")
- **AI-02**: AI-generated plain language summaries of complex connection networks
- **AI-03**: AI detection of implicit connections from media reports (with clear "AI-inferred" confidence label)

### Public API & Export

- **API-01**: Public REST API with rate limiting for external developers and researchers
- **API-02**: CSV and JSON data export for any view or profile
- **API-03**: Print-optimized view for journalist screenshots and reports
- **API-04**: GraphML export for graph data (Gephi-compatible)

### Future Scaling

- **SCALE-01**: Historical data import (legislatures back to 2000)
- **SCALE-02**: Cantonal parliament expansion (26 cantons)
- **SCALE-03**: Linked Open Data / SPARQL endpoint
- **SCALE-04**: Annotation and storytelling layer for guided network exploration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts for general public | Overkill — 90% of users visit once via shared link. Watchlist uses email-only. |
| Crowd-sourced data entry | Data quality collapses without heavy moderation. Switzerland's small population makes this unsustainable. Official register data is the strength. |
| Political commentary or editorial content | Instantly perceived as bias. Destroys neutrality positioning. Let data speak. |
| Real-time data / live updates | Parliamentary data changes slowly. Daily/weekly batch sync is sufficient. |
| Social features (comments, discussions) | Moderation nightmare. Off-topic political arguments. Discussion belongs on existing social platforms. |
| ML-based media scraping | Legal risk (copyright, defamation). Undermines data quality promise. |
| Predictive "corruption risk scores" | Defamation risk. Reduces nuanced relationships to a single number. Conflict-of-interest on specific votes is different from a global score. |
| Private/leaked data | Exclusively public, officially declared data. Non-negotiable ethical boundary. |
| Multi-language UI (v1) | German primary for v1. Architecture must support i18n but UI translation deferred. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1: Foundation and Mock Data | Pending |
| DATA-02 | Phase 1: Foundation and Mock Data | Pending |
| DATA-03 | Phase 1: Foundation and Mock Data | Pending |
| DATA-04 | Phase 1: Foundation and Mock Data | Pending |
| DATA-05 | Phase 1: Foundation and Mock Data | Pending |
| DATA-06 | Phase 1: Foundation and Mock Data | Pending |
| DATA-07 | Phase 1: Foundation and Mock Data | Pending |
| DATA-08 | Phase 1: Foundation and Mock Data | Pending |
| DATA-09 | Phase 1: Foundation and Mock Data | Pending |
| DATA-10 | Phase 1: Foundation and Mock Data | Pending |
| DSGN-01 | Phase 1: Foundation and Mock Data | Pending |
| DSGN-02 | Phase 1: Foundation and Mock Data | Pending |
| DSGN-03 | Phase 1: Foundation and Mock Data | Pending |
| GRAPH-01 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-02 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-03 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-04 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-05 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-06 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-07 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-08 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-09 | Phase 2: Network Graph Visualization | Pending |
| GRAPH-10 | Phase 2: Network Graph Visualization | Pending |
| PROF-01 | Phase 3: Profiles and Search | Pending |
| PROF-02 | Phase 3: Profiles and Search | Pending |
| PROF-03 | Phase 3: Profiles and Search | Pending |
| PROF-04 | Phase 3: Profiles and Search | Pending |
| PROF-05 | Phase 3: Profiles and Search | Pending |
| PROF-06 | Phase 3: Profiles and Search | Pending |
| PROF-07 | Phase 3: Profiles and Search | Pending |
| PROF-08 | Phase 3: Profiles and Search | Pending |
| PROF-09 | Phase 3: Profiles and Search | Pending |
| PROF-10 | Phase 3: Profiles and Search | Pending |
| SRCH-01 | Phase 3: Profiles and Search | Pending |
| SRCH-02 | Phase 3: Profiles and Search | Pending |
| SRCH-03 | Phase 3: Profiles and Search | Pending |
| SRCH-04 | Phase 3: Profiles and Search | Pending |
| SRCH-05 | Phase 3: Profiles and Search | Pending |
| DSGN-04 | Phase 4: Sharing, Filtering, and Polish | Pending |
| DSGN-05 | Phase 4: Sharing, Filtering, and Polish | Pending |
| DSGN-06 | Phase 4: Sharing, Filtering, and Polish | Pending |
| DSGN-07 | Phase 4: Sharing, Filtering, and Polish | Pending |
| DSGN-08 | Phase 4: Sharing, Filtering, and Polish | Pending |
| SHAR-01 | Phase 4: Sharing, Filtering, and Polish | Pending |
| SHAR-02 | Phase 4: Sharing, Filtering, and Polish | Pending |
| SHAR-03 | Phase 4: Sharing, Filtering, and Polish | Pending |
| SHAR-04 | Phase 4: Sharing, Filtering, and Polish | Pending |
| WATCH-01 | Phase 5: Watchlist and Alerts | Pending |
| WATCH-02 | Phase 5: Watchlist and Alerts | Pending |
| WATCH-03 | Phase 5: Watchlist and Alerts | Pending |
| WATCH-04 | Phase 5: Watchlist and Alerts | Pending |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap creation*
