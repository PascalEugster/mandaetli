---
phase: "03"
plan: 03
status: complete
completed_at: "2026-02-27"
---

# Plan 03-03 Summary: Profile Pages, List Pages, Search, and Navigation

## What was built

### Task 1: Profile pages (3 files + 1 client wrapper)

| Page | File | Key Features |
|------|------|--------------|
| Person Profile | `src/app/person/[slug]/page.tsx` | SSR, two-phase data fetching, conflict score, mini ego-graph, voting record, connections |
| Organization Profile | `src/app/organization/[slug]/page.tsx` | SSR, connections list, mini ego-graph, party color lookup |
| Party Profile | `src/app/party/[slug]/page.tsx` | SSR, member list with connection counts, industry heatmap, top industries |
| MiniEgoGraphLoader | `src/components/profiles/MiniEgoGraphLoader.tsx` | "use client" wrapper for `next/dynamic` with `ssr: false` (required by Next.js 16) |

### Task 2: List pages, search, and navigation (8 files)

| Component | File | Key Features |
|-----------|------|--------------|
| Person List | `src/app/person/page.tsx` | Sortable table (name, party, canton, council, connections), URL-based sorting |
| Organization List | `src/app/organization/page.tsx` | Sortable table (name, industry, legal form, HQ, connections) |
| Party List | `src/app/party/page.tsx` | Card grid with color accent, abbreviation, seats, ideology bar, member count |
| Search Page | `src/app/suche/page.tsx` | Server-side search via RPC, grouped results |
| GlobalSearch | `src/components/search/GlobalSearch.tsx` | Client-side autocomplete, 250ms debounce, keyboard nav, "/" shortcut, grouped by type |
| SearchResults | `src/components/search/SearchResults.tsx` | Grouped results display with type icons and counts |
| TopBar | `src/components/layout/TopBar.tsx` | Updated: replaced search placeholder with GlobalSearch component |
| Sidebar | `src/components/layout/Sidebar.tsx` | Updated: removed `disabled: true` from person/organization/party nav items |

## Key implementation details

- **Next.js 16 Server Component restriction**: `next/dynamic` with `ssr: false` cannot be used directly in async Server Components. Solved with a thin "use client" wrapper (`MiniEgoGraphLoader.tsx`) that handles the dynamic import.
- **Two-phase data fetching**: Profile pages first fetch by slug, then run parallel queries using the actor ID.
- **URL-based sorting**: List pages use `searchParams` (server-side) for sort state, rendering sort links as `<Link>` elements rather than client-side state.
- **Server-side search**: The `/suche` page uses a server-side Supabase client (separate from the client-side autocomplete which uses the browser client).

## Verification

- `npx tsc --noEmit`: passes
- `npx @biomejs/biome check src/`: passes (74 files, no issues)
- `npm run build`: passes (all 10 routes render correctly)

## Routes added

| Route | Type | Description |
|-------|------|-------------|
| `/person` | Dynamic (SSR) | Politician list with sortable table |
| `/person/[slug]` | Dynamic (SSR) | Politician profile |
| `/organization` | Dynamic (SSR) | Organization list with sortable table |
| `/organization/[slug]` | Dynamic (SSR) | Organization profile |
| `/party` | Dynamic (SSR) | Party cards grid |
| `/party/[slug]` | Dynamic (SSR) | Party profile |
| `/suche` | Dynamic (SSR) | Full search results page |

## Files created/modified

| File | Lines | Status |
|------|-------|--------|
| `src/app/person/[slug]/page.tsx` | 138 | Created |
| `src/app/organization/[slug]/page.tsx` | 74 | Created |
| `src/app/party/[slug]/page.tsx` | 180 | Created |
| `src/app/person/page.tsx` | 132 | Created |
| `src/app/organization/page.tsx` | 103 | Created |
| `src/app/party/page.tsx` | 85 | Created |
| `src/app/suche/page.tsx` | 46 | Created |
| `src/components/search/GlobalSearch.tsx` | 182 | Created |
| `src/components/search/SearchResults.tsx` | 82 | Created |
| `src/components/profiles/MiniEgoGraphLoader.tsx` | 23 | Created |
| `src/components/layout/TopBar.tsx` | 47 | Modified |
| `src/components/layout/Sidebar.tsx` | 100 | Modified |
