# Phase 3 Discussion: Profiles and Search

**Phase:** 3 of 5
**Requirements:** PROF-01 through PROF-10, SRCH-01 through SRCH-05
**Date:** 2026-02-27

## Current State

Phase 2 delivered:
- Interactive /netzwerk page with Sigma.js + Graphology (~800 nodes, ~2182 edges)
- Progressive disclosure: party overview -> filtered -> focused ego networks
- Filter panel (party, canton, council, industry, connection type)
- In-graph search with camera zoom-to
- Path finding between two actors
- Detail panel with node/edge/path views
- URL state persistence via nuqs
- Keyboard shortcuts (/, F, L, Escape, 0)

Database contains:
- 248 persons (politicians), 522 organizations, 8 parties, 22 commissions
- 2,182 connections with source_url, confidence, role, valid_from/valid_until
- 5 data sources with freshness timestamps
- ~3,664 vote records across multiple votes

## What Phase 3 Needs to Deliver

### 1. Politician Profile Page (`/person/[slug]`)

SSR page showing:
- Name, photo (portrait_url), party, canton, council (NR/SR)
- Date of birth, gender, language
- Commission memberships
- All Interessenbindungen (connections) with source links, confidence badges
- Voting record (from vote_records table)
- Conflict-of-interest score (algorithm TBD -- likely ratio of votes where connected orgs had interests)
- Mini ego-graph (reuse Sigma.js from Phase 2?)

Available data fields:
- actors: name, first_name, last_name, slug, actor_type, canton, council, party_id, date_of_birth, gender, language, portrait_url, website, metadata
- connections: source_actor_id, target_actor_id, connection_type, confidence, role, source_url, valid_from, valid_until, is_paid
- vote_records: actor_id, vote_id, decision (yes/no/abstain/absent/not_participating)
- votes: affair_title, vote_date, council, topic_category, description

### 2. Organization Profile Page (`/organization/[slug]`)

SSR page showing:
- Name, industry, headquarters, legal_form, founded, website, uid (Zefix)
- All connected politicians with roles
- Mini network graph of the organization's connections
- Connection type distribution

### 3. Party Profile Page (`/party/[slug]`)

SSR page showing:
- Party name, abbreviation, color, ideology_position
- Member count, seats_nr, seats_sr
- All members (sortable list)
- Aggregate connection statistics
- Top connected industries
- Industry/branch heatmap across parties (comparison)

### 4. Global Search

- Search bar in TopBar (accessible from all pages)
- Instant autocomplete with results grouped by actor type
- Relevance ranking
- Filters: party, canton, council, actor type
- Full search results page at `/suche?q=...`

### 5. List Views

- `/person` -- all politicians (sortable, filterable)
- `/organization` -- all organizations (sortable, filterable)
- `/party` -- all parties

## Open Questions for Architect

1. **Mini ego-graph on profile pages**: Should we reuse the full Sigma.js setup or create a lightweight static SVG/canvas visualization? The full setup requires dynamic import + SigmaContainer. A simpler approach might render a static graph image server-side.

2. **Conflict-of-interest score**: What algorithm? Simple options: (a) count connections to orgs in industries where they voted, (b) weighted score factoring confidence levels, (c) defer to Phase 4 and show raw data only.

3. **Search architecture**: Full-text search via PostgreSQL `tsvector` + `pg_trgm` (already have `show_trgm` function in DB), or client-side filtering from pre-fetched actor list?

4. **Data fetching patterns**: For profile pages, should we use Supabase joins (`.select('*, connections(*)')`) or separate parallel queries? Concern about N+1 for connection lists.

5. **Pagination vs infinite scroll**: For politician lists and connection lists, which approach?

## Open Questions for UX Designer

1. **Profile page layout**: Single-column scrollable or two-column (metadata left, content right)? How should the mini ego-graph be positioned?

2. **Connection list design**: Table vs card layout? How to show confidence badges inline? Grouping by connection type or chronological?

3. **Search UX**: Inline dropdown autocomplete vs full modal (like cmdk)? Where does the search bar live -- in TopBar or as a separate component?

4. **Party page industry heatmap**: What visualization? Color-coded grid? Bar chart? How to compare across parties?

5. **Mobile profile pages**: Stack sections or use tabs? How to handle the mini ego-graph on mobile?
