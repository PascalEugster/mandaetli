# Phase 4: Sharing, Filtering, and Polish - Research

**Researched:** 2026-02-28
**Phase:** 4 - Sharing, Filtering, and Polish
**Requirements:** DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, SHAR-01, SHAR-02, SHAR-03, SHAR-04

## Codebase Assessment

### Current State
- **6 pages**: landing, netzwerk (graph), person/[slug], organization/[slug], party/[slug], suche
- **2 list pages**: person, organization (tables with sort links)
- **nuqs already integrated**: Graph uses `useQueryStates(graphSearchParams)` for selected, parties, cantons, councils, industries, connectionTypes, pathFrom, pathTo, q
- **ConfidenceBadge component exists**: Pill-style badge with confidence dot, used in ConnectionList but NOT in graph DetailPanel (which uses plain text labels)
- **No OG images**: `generateMetadata` only sets `title`, no `openGraph` or `twitter` fields
- **No copy-link button**: TopBar has logo, GlobalSearch, data status indicator, About link
- **No source tooltips**: Numbers shown without data source attribution on hover
- **No mobile responsiveness**: Tables only (no card layout), no responsive breakpoints on list/profile pages, MiniEgoGraph hidden below lg but no link replacement
- **Graph has no mobile alternative**: Full WebGL graph rendered on all screen sizes

### Key Dependencies
- `next: 16.1.6` - supports `opengraph-image.tsx` route convention with `ImageResponse`
- `nuqs: ^2` - URL state management, already used for graph params
- `lucide-react` - icon library
- `@radix-ui` via `radix-ui: ^1.4.3` - primitive UI components
- `tailwindcss: ^4` - utility-first CSS
- `Inter` font loaded via `next/font/google` in layout.tsx

### Existing Components to Extend
1. **ConfidenceBadge** (`src/components/data-freshness/ConfidenceBadge.tsx`) - pill badge, needs to be added to graph DetailPanel
2. **ConnectionList** (`src/components/profiles/ConnectionList.tsx`) - already has confidence dots in table, needs expand/collapse for >10 items
3. **ConflictScore** (`src/components/profiles/ConflictScore.tsx`) - uses `scoreColor()` with green/yellow/red - MUST remove per neutrality principle
4. **DetailPanel** (`src/components/graph/DetailPanel.tsx`) - uses CONFIDENCE_LABELS text, needs ConfidenceBadge pills instead
5. **TopBar** (`src/components/layout/TopBar.tsx`) - needs copy-link button
6. **VotingRecord** (`src/components/profiles/VotingRecord.tsx`) - no summary bar

## Technical Findings

### OG Image Generation (Next.js 16)
- Use `opengraph-image.tsx` route file convention in each profile directory
- `ImageResponse` from `next/og` renders JSX to 1200x630 PNG
- Font loading: Inter font must be loaded as ArrayBuffer via `fetch()` in the OG image route (cannot use `next/font/google` there)
- Each route needs its own `opengraph-image.tsx` alongside `page.tsx`
- Routes: `src/app/person/[slug]/opengraph-image.tsx`, `src/app/organization/[slug]/opengraph-image.tsx`, `src/app/party/[slug]/opengraph-image.tsx`, `src/app/netzwerk/opengraph-image.tsx`
- `generateMetadata` must add `openGraph` and `twitter` card properties

### URL State with nuqs
- Graph already persists: selected, parties, cantons, councils, industries, connectionTypes, pathFrom, pathTo, q
- Need to ADD: camera state (cx, cy, cz) with debounce -- but this is complex because sigma camera events fire rapidly
- List pages: already use searchParams for sort/dir -- need to add filter params (party, canton, council for person list)
- Search page: already has `q` param -- need to add type filter tab

### Source Tooltips
- shadcn/ui Tooltip component exists at `src/components/ui/tooltip.tsx`
- Create a `SourceTooltip` wrapper that shows dotted underline on numbers
- Content: "Quelle: {source_name} / Stand: {date}"
- Mock data has `source_name`, `source_url`, `source_retrieved_at` on connections
- For aggregate numbers (connection counts), show generic "Quelle: parlament.ch"

### Mobile Responsiveness
- Tailwind responsive prefixes: sm (640px), md (768px), lg (1024px)
- Profile pages need: center header on mobile, hide less-critical table columns
- List pages need: card layout below md, table above md
- Graph page needs: entire replacement below 768px with Connection Explorer (card list)
- MiniEgoGraph: already `hidden lg:block` on profile pages, add text link to /netzwerk as replacement

### Confidence Badge Placement Gaps
- **DetailPanel EdgeDetail**: Shows "Vertrauen" as plain text -- replace with ConfidenceBadge pill
- **DetailPanel NodeDetail connections**: Shows connection type + role, no confidence indicator -- add confidence dot
- **NodeTooltip**: Needs review for confidence info

## Risk Assessment

### Low Risk
- OG images: well-documented Next.js feature, straightforward implementation
- Copy link button: simple clipboard API + toast
- Confidence badge consistency: existing component, just needs more usage

### Medium Risk
- Mobile card layouts for list pages: significant JSX rework, needs testing
- Graph camera state in URL: sigma camera events are high-frequency, needs careful debouncing
- Connection Explorer mobile alternative: new component, moderate complexity

### Potential Issues
- Inter font for OG images: must fetch the font file at build time, may need to bundle a .woff file
- Camera state debounce: 500ms may feel laggy for sharing, too fast may hammer URL state
- Mobile graph alternative needs access to same data as full graph page

## RESEARCH COMPLETE
