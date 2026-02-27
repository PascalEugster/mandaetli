# Phase 1 Implementation Plan: Foundation and Mock Data

**Phase:** 1 of 5
**Requirements:** DATA-01 through DATA-10, DSGN-01 through DSGN-03
**Approach:** See DISCUSSION.md
**Updated:** 2026-02-27 (incorporated architect feedback)

## Task Breakdown

### Task 01-01: Project Setup and Design System
**Goal:** Next.js project with Tailwind CSS, shadcn/ui, Biome, local Supabase, and the dark-mode-first design system
**Depends on:** Nothing
**Acceptance criteria:**
- `npm run dev` starts successfully on localhost:3000
- `npx supabase start` runs local Supabase
- Dark-mode landing page renders with correct background colors and Swiss red accent
- Inter font loaded, typography system applied
- shadcn/ui initialized with custom dark theme
- Biome configured for linting/formatting
- TypeScript compiles cleanly with strict mode

**Steps:**

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint=false --app --src-dir --import-alias="@/*"
   ```

2. **Install dependencies**
   ```bash
   # Core
   npm install @supabase/supabase-js @supabase/ssr zod nuqs

   # Dev
   npm install -D @biomejs/biome supabase
   ```

3. **Initialize Supabase local development**
   ```bash
   npx supabase init
   npx supabase start
   ```

4. **Configure Biome** -- `biome.json` at project root

5. **Configure Tailwind CSS with custom design tokens** in `src/app/globals.css`:
   - Background: `#0A0E1A` (primary), `#111827` (card), `#1E293B` (elevated)
   - Accent: `#FF0000` (Swiss red), `#CC0000` (hover)
   - Text: `#F8FAFC` (primary), `#94A3B8` (secondary), `#64748B` (muted)
   - Actor colors: person `#3B82F6`, org `#F59E0B`, party `#10B981`
   - Confidence colors: verified `#10B981`, declared `#3B82F6`, reported `#F59E0B`, inferred `#64748B`

6. **Initialize shadcn/ui** (dark mode default, Slate base)
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add badge button card separator tooltip
   ```

7. **Set up Inter font** via `next/font/google`

8. **Create Supabase client utilities**
   - `src/lib/supabase/server.ts` -- Server-side client (cookies-based)
   - `src/lib/supabase/client.ts` -- Browser client
   - `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from local Supabase)

9. **Create root layout** (`src/app/layout.tsx`)
   - Dark background by default
   - Inter font applied
   - Metadata (title, description)
   - Navigation component

10. **Create Navigation component** (`src/components/layout/Navigation.tsx`)
    - Top bar: Logo "Seilschaften.ch" with Swiss red accent
    - Nav links: Netzwerk, Personen, Organisationen, Parteien (placeholder links)
    - Search placeholder
    - Sticky, compact

11. **Create landing page** (`src/app/page.tsx`)
    - Hero with tagline
    - Statistics cards (hardcoded placeholders until Task 01-03)
    - Graph placeholder
    - Data source freshness section (placeholder until Task 01-03)

12. **Add npm scripts** to `package.json`

**Files created/modified:**
- `biome.json`, `.env.local`
- `supabase/config.toml`
- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- `src/components/layout/Navigation.tsx`
- `src/components/ui/{badge,button,card,separator,tooltip}.tsx` (via shadcn)
- `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`

**Commit:** `feat: initialize Next.js project with dark-mode design system and local Supabase`

---

### Task 01-02: Database Schema and TypeScript Types
**Goal:** Full PostgreSQL schema with ENUMs, indexes, and auto-generated TypeScript types
**Depends on:** Task 01-01 (Supabase must be running)
**Acceptance criteria:**
- Schema migration applies cleanly via `supabase db push`
- All ENUMs, tables, and indexes created
- `supabase gen types typescript --local` generates clean types
- Hand-written domain types derive from generated DB types
- Swiss constants file with all cantons, parties, commissions, industries

**Steps:**

1. **Create initial schema migration** (`supabase/migrations/00001_initial_schema.sql`)

   ENUMs:
   - `actor_type`: person, organization, party
   - `council_type`: NR, SR
   - `connection_type`: mandate, membership, lobbying, donation, employment
   - `confidence_level`: verified, declared, media_reported, inferred

   Tables:
   - `data_sources` -- name, display_name, base_url, last_synced_at, record_count, sync_frequency_hours
   - `actors` -- hybrid normalized: slug, actor_type, name, name_fr, name_it, first_name, last_name, party_id (self-FK), canton, council, portrait_url, date_of_birth, abbreviation, org_type, uid, website, metadata JSONB
   - `connections` -- source_actor_id, target_actor_id, connection_type, role, role_fr, role_it, is_paid, confidence, data_source_id (FK), source_url, source_retrieved_at, valid_from, valid_until, metadata JSONB
   - `votes` -- affair_id, affair_title (multilingual), vote_date, council, topic_category
   - `vote_records` -- vote_id (FK), actor_id (FK), decision

   Indexes:
   - actors: type, slug, canton, council, party_id, name trigram (GIN)
   - connections: source, target, type, confidence, active (WHERE valid_until IS NULL)
   - votes: date
   - vote_records: actor_id, vote_id

2. **Apply migration**
   ```bash
   npx supabase db push
   ```

3. **Generate TypeScript types**
   ```bash
   npx supabase gen types typescript --local > src/types/database.ts
   ```

4. **Create domain types** (`src/types/domain.ts`)
   - Derive from auto-generated DB types
   - `type Actor = Database['public']['Tables']['actors']['Row']`
   - `type Person = Actor & { actor_type: 'person' }`
   - `type Organization = Actor & { actor_type: 'organization' }`
   - `type Party = Actor & { actor_type: 'party' }`
   - Similar for Connection, DataSource, Vote, VoteRecord

5. **Create Swiss constants** (`src/lib/utils/constants.ts`)
   - All 26 cantons with codes and names (DE/FR)
   - Major parties with slug, name, abbreviation, color, ideology position
   - Parliamentary commissions
   - Industry sectors
   - Connection type labels (DE/FR: Verwaltungsrat, Beirat, Stiftungsrat, etc.)

6. **Create utility formatters** (`src/lib/utils/formatters.ts`)
   - Swiss date formatting (dd.MM.yyyy)
   - Canton code to name
   - Relative time ("vor 2 Tagen")
   - Confidence level to display label

**Files created:**
- `supabase/migrations/00001_initial_schema.sql`
- `src/types/database.ts` (auto-generated)
- `src/types/domain.ts`
- `src/types/index.ts`
- `src/lib/utils/constants.ts`
- `src/lib/utils/formatters.ts`

**Commit:** `feat: add database schema with ENUMs and auto-generated TypeScript types`

---

### Task 01-03: Mock Data Seed and Landing Page Integration
**Goal:** Realistic mock data seeded into local Supabase + landing page showing real data
**Depends on:** Task 01-02 (schema must exist)
**Acceptance criteria:**
- Supabase contains 246 council members (200 NR + 46 SR) with correct party distribution
- ~500 organizations with realistic Swiss names and industries
- 7-8 major parties + minor parties
- ~2000-5000 connections with source attribution and confidence levels
- ~50 votes with records for all 246 politicians
- 5 data sources with last_synced timestamps
- Landing page displays real counts from Supabase
- Data source freshness cards visible
- Confidence badges render on sample connections
- Multilingual names, nullable fields, dirty data present

**Steps:**

1. **Install faker**
   ```bash
   npm install -D @faker-js/faker
   ```

2. **Create seed script** (`supabase/seed.ts`)
   Using `@faker-js/faker/locale/de_CH` with these distributions:

   **Parties (7-8 major):**
   - SVP (62 NR, ~6 SR), SP (39 NR, ~9 SR), FDP (28 NR, ~12 SR)
   - Die Mitte (29 NR, ~13 SR), Grune (23 NR, ~4 SR), GLP (16 NR, ~2 SR)
   - EVP (2 NR), EDU (1 NR)

   **Politicians (246 total):**
   - All 26 cantons represented
   - ~15% French names (VD, GE, FR, NE, VS, JU cantons)
   - ~5% Italian names (TI, GR cantons)
   - ~10% null portrait_url
   - Some null date_of_birth

   **Organizations (~500):**
   - Industries: banking, pharma, insurance, energy, agriculture, tech, defense, consulting, NGO, transport, real estate, media, education, health
   - Legal forms: AG, GmbH, Verein, Stiftung, Genossenschaft
   - Swiss UIDs (CHE-xxx.xxx.xxx)
   - Some French/Italian-only names

   **Connections (~3000-5000):**
   - Power-law distribution: banks/pharma connected to many politicians
   - Most politicians: 3-8 connections; some: 15+
   - Types: mandate 40%, membership 25%, lobbying 15%, employment 10%, donation 10%
   - Confidence: declared 60%, verified 20%, media_reported 15%, inferred 5%
   - ~20% with valid_until set (historical)

   **Data Sources (5):**
   - parlament.ch, zefix, lobbywatch, lobbyregister, eidg_kanzlei
   - Varied last_synced_at timestamps

   **Votes (~50) + Records:**
   - Topics: finance, healthcare, environment, immigration, defense, agriculture
   - Party cohesion ~80%
   - ~5% absent per vote

3. **Run seed**
   ```bash
   npx tsx supabase/seed.ts
   ```

4. **Create DataSourceCard component** (`src/components/data-freshness/DataSourceCard.tsx`)
   - Shows source name, last synced time (relative), record count
   - Uses Card component from shadcn/ui

5. **Create ConfidenceBadge component** (`src/components/data-freshness/ConfidenceBadge.tsx`)
   - Color-coded badge for verified/declared/media_reported/inferred
   - Tooltip with explanation on hover

6. **Update landing page** (`src/app/page.tsx`)
   - Server Component fetching real counts from Supabase
   - Statistics cards with actual numbers
   - Data source freshness section with DataSourceCards
   - Sample recent connections with ConfidenceBadges
   - Footer with source attribution links

7. **Regenerate types** after seeding (if schema changes)
   ```bash
   npx supabase gen types typescript --local > src/types/database.ts
   ```

**Files created/modified:**
- `supabase/seed.ts` (new)
- `src/components/data-freshness/DataSourceCard.tsx` (new)
- `src/components/data-freshness/ConfidenceBadge.tsx` (new)
- `src/app/page.tsx` (modified -- real data)

**Commit:** `feat: seed mock data (246 politicians, 500 orgs) and integrate landing page`

---

## Execution Order

```
01-01: Project Setup and Design System (+ Supabase local)
  |
01-02: Database Schema and TypeScript Types
  |
01-03: Mock Data Seed and Landing Page Integration
```

Sequential -- each task depends on the previous.

## Verification Checklist

After all tasks complete:
1. [ ] `npx supabase start` -- local Supabase running
2. [ ] `npm run dev` -- app starts, dark-mode landing page with Swiss red
3. [ ] `npx tsc --noEmit` -- no type errors
4. [ ] Landing page shows real statistics from Supabase (246 politicians, etc.)
5. [ ] Data source freshness cards show last synced timestamps
6. [ ] Confidence badges render correctly (verified/declared/reported/inferred)
7. [ ] Supabase Studio (localhost:54323) shows all seeded data
8. [ ] Multilingual names visible in data (FR/IT names for Romandie/Ticino politicians)

---
*Plan created: 2026-02-27*
*Updated with architect feedback: 2026-02-27*
