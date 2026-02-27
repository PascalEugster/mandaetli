# Phase 1 Discussion: Foundation and Mock Data

**Phase:** 1 of 5
**Date:** 2026-02-27
**Requirements:** DATA-01 through DATA-10, DSGN-01 through DSGN-03
**Research flag:** Standard patterns -- well-documented Supabase + Next.js integration
**Input from:** architect, ux-designer

## Approach Summary

Phase 1 establishes three pillars: (1) local Supabase with the full PostgreSQL schema and mock data, (2) auto-generated TypeScript types from the schema, and (3) a dark-mode-first design system with the application shell. All subsequent phases build on this foundation.

## Architecture Decisions

### 1. Mock Data Strategy: Local Supabase from Day One

**Decision:** Set up local Supabase (`supabase init` + `supabase start`) in Phase 1. Seed mock data via a TypeScript seed script (`supabase/seed.ts`) using `@faker-js/faker/locale/de_CH`.

**Rationale (per architect):**
- Success criterion #2 explicitly says "The Supabase database contains..." -- it requires Supabase
- Auto-generated TypeScript types via `supabase gen types` are the foundation for criterion #5
- The seed script validates the schema immediately -- JSON files would hide schema bugs
- Server Components query Supabase via `@supabase/ssr` from day one -- no throwaway data layer
- Full-text search indexes (`pg_trgm`) created in schema now, ready for Phase 3

**Trade-off:** Requires Docker for local Supabase. Setup takes ~10 minutes. Worth it for schema validation and type generation.

### 2. Database Schema: Hybrid Normalized + JSONB (Architect Recommendation)

**Decision:** Normalize frequently-queried fields into proper columns with PostgreSQL ENUMs. Keep JSONB only as overflow for rare/source-specific fields.

**Why not pure JSONB:** Party, canton, and council are queried in every filter operation. Burying them in JSONB means no indexes, JSONB extraction on every query, and worse generated types.

**Core tables:**

**`actors`** -- Graph nodes
- Normalized: `id`, `slug`, `actor_type` (ENUM), `name`, `name_fr`, `name_it`
- Person-specific: `first_name`, `last_name`, `party_id` (FK to party actor), `canton`, `council` (ENUM), `portrait_url`, `date_of_birth`
- Org/party-specific: `abbreviation`, `org_type`, `uid`, `website`
- Overflow: `metadata` JSONB

**`connections`** -- Graph edges
- Normalized: `source_actor_id`, `target_actor_id`, `connection_type` (ENUM), `role`, `role_fr`, `role_it`, `is_paid`, `confidence` (ENUM)
- Source tracking: `data_source_id` (FK), `source_url`, `source_retrieved_at`
- Temporal: `valid_from`, `valid_until`
- Overflow: `metadata` JSONB

**`data_sources`** -- Source attribution + freshness (DATA-07, DATA-09)
- `name`, `display_name`, `base_url`, `last_synced_at`, `sync_frequency_hours`, `record_count`

**`votes`** + **`vote_records`** -- Voting records (DATA-10)
- `affair_id`, `affair_title` (multilingual), `vote_date`, `council`
- Records: `vote_id`, `actor_id`, `decision` (yes/no/abstain/absent/president)

**ENUMs used for:** `actor_type`, `council_type`, `connection_type`, `confidence_level` -- cleaner types, integer storage, better generated TS types.

### 3. Project Structure (Phase 1 Scoped)

Per architect: only create what Phase 1 needs. No empty placeholder directories.

```
src/
  app/
    layout.tsx              -- Root layout: dark mode, fonts, navigation shell
    page.tsx                -- Landing page with data freshness dashboard
    globals.css             -- Tailwind imports, CSS custom properties
  components/
    ui/                     -- shadcn/ui components (added via CLI)
    layout/
      Navigation.tsx        -- Top navigation bar
      Footer.tsx            -- Footer with data source links
    data-freshness/
      DataSourceCard.tsx    -- Card showing source name, last synced, record count
      ConfidenceBadge.tsx   -- Reusable badge for confidence levels
  lib/
    supabase/
      client.ts             -- Browser Supabase client
      server.ts             -- Server Supabase client
    utils/
      formatters.ts         -- Swiss date formatting, canton names
  types/
    database.ts             -- AUTO-GENERATED via `supabase gen types`
    domain.ts               -- Domain types derived from DB types
supabase/
  config.toml               -- Supabase local config
  migrations/
    00001_initial_schema.sql -- Full schema with ENUMs and indexes
  seed.ts                    -- Mock data seed script
biome.json
```

Key: No `mock/` directory. Mock data lives in `supabase/seed.ts`. No `hooks/` yet (Phase 2). `types/database.ts` is auto-generated, never hand-written.

### 4. Design System: Dark-Mode-First with Swiss Identity (UX Designer Spec)

**Background layers (5 levels, consistent blue tint hue 218-220):**
- `--background`: `#080c14` (page background, deepest)
- `--surface-0`: `#0c1220` (sidebar, top bar)
- `--surface-1`: `#111827` (cards, panels)
- `--surface-2`: `#1a2236` (elevated: dropdowns, modals, hover on cards)
- `--surface-3`: `#243049` (active sidebar items, hover on surface-1)

**Text hierarchy (Slate scale, blue-tinted grays):**
- `--text-primary`: `#f1f5f9` (headings, names)
- `--text-secondary`: `#cbd5e1` (body text)
- `--text-tertiary`: `#94a3b8` (metadata, timestamps)
- `--text-muted`: `#64748b` (disabled, placeholder)

**Swiss red accent (used sparingly):**
- `--accent`: `#FF0000` (primary CTA, logo, active nav)
- `--accent-hover`: `#e60000` (slightly darker, not lighter)
- `--accent-active`: `#cc0000` (pressed)
- `--accent-muted`: `#ff000020` (12% opacity backgrounds)

**Actor type colors:**
- Politician: `#3b82f6` (blue)
- Party: `#a855f7` (purple)
- Organization: `#22c55e` (green)
- Company: `#f59e0b` (amber)

**Confidence level badges (pill shape, 12% opacity bg + dot + label):**
- Verified: `#22c55e` (green)
- Declared: `#3b82f6` (blue)
- Media-reported: `#eab308` (yellow)
- Inferred: `#f97316` (orange)

**Typography:**
- Primary: Inter (headings + body), JetBrains Mono (data values)
- 14px base, tabular-nums globally
- Custom scale: display (28px), h1 (22px), h2 (17px), h3 (14px semibold), body (14px), body-sm (12.5px), caption (11px)
- Negative letter-spacing on headings, positive on captions

**Navigation: Top bar + collapsible sidebar hybrid**
- Top bar (64px): Logo + search placeholder + data status
- Left sidebar (240px, collapses to 56px): Dashboard, Network, Politicians, Organizations, Parties, Sources & Method
- Active item: surface-3 bg + 3px red left border
- Disabled items: muted text + "Soon" badge
- Mobile: sidebar as Sheet (slides from left)

**Landing page layout:** Hero (radial gradient bg) + stat cards (2x2 grid) + data sources panel (horizontal scroll) + recent connections table (10 rows)

**No shadows** -- depth via background color differentiation only.

### 5. shadcn/ui Components for Phase 1

Install 10 components: `button`, `card`, `badge`, `tooltip`, `separator`, `table`, `navigation-menu`, `sheet`, `collapsible`, `skeleton`

## Success Criteria Mapping

| Criterion | How Satisfied |
|-----------|--------------|
| 1. `npm run dev` shows dark-mode landing page with Swiss red accents and nav shell | Next.js app with Tailwind dark theme, Swiss red accent, Navigation component |
| 2. Supabase DB contains 246 members, ~500 orgs, ~50 parties, mock votes | Local Supabase with seeded mock data via `supabase/seed.ts` |
| 3. Every connection has source attribution and confidence level | `data_source_id` FK + `confidence` ENUM on every connection |
| 4. Data freshness timestamps visible per source | `data_sources.last_synced_at` displayed in DataSourceCard component |
| 5. TypeScript types compile cleanly reflecting Swiss API structures | Auto-generated via `supabase gen types` + hand-written domain types |

## Open Questions Resolved

1. **Supabase now or later?** Now. Success criteria require it. Auto-generated types are the cleanest path.
2. **JSONB vs normalized?** Hybrid -- normalize frequently-queried fields (canton, council, party_id), JSONB only for overflow.
3. **ENUMs vs TEXT CHECK?** ENUMs. Better types, integer storage, cleaner generated TS.
4. **Mock data location?** `supabase/seed.ts`, not a separate `mock/` directory.
5. **Type generation?** Auto-generated `database.ts` via CLI, hand-written `domain.ts` for semantic wrappers.

---
*Discussion completed: 2026-02-27*
*Updated with architect input: 2026-02-27*
*Updated with UX designer input: 2026-02-27*
