# Mandaetli.ch

## What This Is

A public web platform that visualizes all connections between Swiss politicians, parties, companies, and lobby groups as an interactive network graph. Built exclusively on public data from official Swiss registers. Open source (MIT License), designed for journalists, researchers, NGOs, and Swiss citizens who want to understand the economic interests behind political decisions.

## Core Value

Any Swiss citizen can find and understand the economic connections behind any National Council member in under 2 minutes — and share that finding via a link.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Import all 246 council members with declared interests from parlament.ch
- [ ] Interactive network graph visualizing connections between actors (politicians, parties, orgs, companies)
- [ ] Dedicated actor profile pages (politicians, parties, organizations) showing all known connections
- [ ] Graph filtering, zooming, searching, and actor highlighting
- [ ] Shareable links for any view, profile, or connection
- [ ] Every connection displays its source with confidence level (verified, media-reported, AI-inferred)
- [ ] Dark-mode-first design (Palantir-style intelligence dashboard meets Swiss citizen portal)
- [ ] Mock data system for development before real API integration
- [ ] Commercial register (Zefix) integration for board mandates and company structures
- [ ] Party profiles and industry/branch overview (heatmap across parties)
- [ ] Voting analysis with conflict-of-interest score
- [ ] Campaign financing integration with Sankey diagram visualization
- [ ] Claude-powered AI analysis layer for natural language queries and connection summaries
- [ ] Global search across all actors and connections
- [ ] Watchlist with email alerts for tracked actors
- [ ] Public API for external developers and researchers
- [ ] Journalist export features (print, data export)
- [ ] Mobile-optimized responsive design

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Cantonal parliaments — deferred to Phase 5+, focus on federal level first
- Historical data before current legislature — deferred, MVP is current state
- International comparisons — future scaling, not core value
- ML-based media scraping for connection detection — future Phase 5+
- User accounts for general public — journalists/researchers first, general auth later
- Private/leaked data — exclusively public, officially declared data
- Political bias or editorial commentary — platform shows facts, never judges
- Real-time chat or social features — not a community platform

## Context

**The Swiss transparency problem:** Switzerland has extensive public registers (parlament.ch, Zefix/Handelsregister, Lobbyregister, Lobbywatch.ch) but they exist in complete isolation. No tool connects them into a coherent picture. Parliamentarians can hold unlimited Interessenbindungen (declared interests), party donations were fully anonymous until 2021, and lobbyists have free Bundeshaus access via guest badges.

**Data sources (all public):**
- **parlament.ch** — All Ratsmitglieder with declared Interessenbindungen and voting records (official API)
- **Lobbyregister des Bundes** — Accredited lobbyists (since 2022, via opendata.swiss)
- **Zefix / Handelsregister** — Verwaltungsratsmandate and company structures (official REST API)
- **Eidgenössische Kanzlei** — Campaign financing and Abstimmungskomitees (since 2021)
- **Lobbywatch.ch** — Pre-processed NGO data about parliamentary lobbying (API available)
- **Swissvotes** — Historical Volksabstimmungsdaten

**Development approach:** Mock data first. Build the full UI/UX with realistic mock data representing Swiss political actors, then swap in real data pipelines. This allows parallel development of frontend functionality and data ingestion.

**Ethical framework:**
- Equal treatment of all parties — no political agenda
- Every connection has a verifiable source — no speculation
- Connections are facts, not judgments — the platform does not editorialize
- DSG-compliant (Swiss data protection law) — only publicly declared data
- Structured correction process for error reports
- Open source so methodology is fully transparent and auditable

**Existing landscape:** Lobbywatch.ch exists as an NGO effort but focuses narrowly on parliamentary lobbying. No existing tool cross-references all registers into a visual network.

## Constraints

- **Tech stack**: Next.js + TypeScript, Supabase (PostgreSQL) for data/auth, client-side graph visualization library (D3/Sigma.js)
- **License**: MIT — full open source, must be auditable
- **Data**: Exclusively public data from official Swiss registers — no scraping of private information
- **Legal**: DSG-compliant, no personal data beyond what's publicly declared
- **Design**: Dark mode default, Swiss red (#FF0000) as only accent color, data-dense but clear hierarchy, progressive disclosure pattern
- **Accessibility**: Must be usable by non-technical Swiss citizens
- **Performance**: Graph must handle 246+ politicians with thousands of connections smoothly
- **Internationalization**: German primary, French/Italian desirable but not v1

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + TypeScript | SSR for SEO, React ecosystem, strong typing | — Pending |
| Supabase (PostgreSQL) over Neo4j | Covers auth/storage/real-time/API in one package, sufficient for Swiss political graph scale (~246 politicians + orgs), mock data easy to seed. Neo4j can be added later if graph traversal performance requires it | — Pending |
| Mock data first | Allows parallel UI/UX development without waiting for API integrations. Enables rapid iteration on visualization and interaction patterns | — Pending |
| Dark mode default | Platform is designed for intensive research sessions (journalist-first). Palantir-style intelligence aesthetic builds trust for data platform | — Pending |
| Client-side graph visualization | Network graph rendered in browser (D3/Sigma.js) for interactive exploration. Server provides data, client renders | — Pending |

---
*Last updated: 2026-02-27 after initialization*
