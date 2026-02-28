# Phase 4: Sharing, Filtering, and Polish - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the platform shareable, responsive, and polished. Every view gets a unique shareable URL, OG preview cards for social media, progressive disclosure across all views, source tooltips on data points, confidence badges everywhere, mobile responsiveness, and a mobile alternative for the graph view.

Requirements: DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, SHAR-01, SHAR-02, SHAR-03, SHAR-04

</domain>

<decisions>
## Implementation Decisions

### OG Preview Cards
- Dynamic OG images via Next.js `opengraph-image.tsx` per route (1200x630px)
- Background: `#080c14` (our --background), left accent bar in party/entity color
- Politician: photo, name, party/canton/council, connection breakdown, top 3 connections
- Organization: industry icon, name, industry/location, connected politician count
- Party: abbreviation circle in party color, stats, top 3 industries
- Graph: static image with "Netzwerk der Schweizer Politik" text
- Inter font loaded as ArrayBuffer for ImageResponse API
- Each profile route gets `opengraph-image.tsx` in its directory
- `generateMetadata` enhanced with `openGraph` and `twitter` card properties

### Shareable URLs
- Graph camera state (`cx`, `cy`, `cz`) added to nuqs params, debounced 500ms
- List page filters in URL: `/person?party=svp,fdp&canton=be&council=nr`
- Search type tab in URL: `/suche?q=economie&type=organization`
- "Copy link" button in TopBar (Lucide `Link2` icon, ghost style)
- Toast: "Link kopiert", bottom-center, 2 seconds, auto-dismiss

### Progressive Disclosure and Source Tooltips
- `SourceTooltip` component wrapping numbers with dotted underline
- Shows "Quelle: parlament.ch / Stand: 15.11.2025" on hover
- Connection list: show first 10, "Alle X anzeigen" expandable
- Connection type filter tabs above connection table (dynamic, only tabs with data)
- Voting summary stacked bar (8px, green/red/yellow/gray segments) above vote table
- Conflict score: REMOVE color coding (green/yellow/red). Always use --text-primary and Swiss red bar. Neutrality principle.

### Confidence Badge Consistency
- Graph detail panel: replace text labels with actual ConfidenceBadge pill components
- Graph tooltips: add confidence dot to "top connections" section
- No new component needed -- use existing ConfidenceBadge more broadly

### Mobile Responsiveness
- Profile pages: center-aligned header on mobile, hide less-critical table columns below md
- Mini ego-graph: hidden on mobile (lg:block), replaced with text link to /netzwerk
- List pages: card layout below md, table above md (both render from same data)
- Search: filter sidebar hidden on mobile, replaced with bottom Sheet
- Graph: replace entirely below 768px with Connection Explorer card/list view
  - Party filter chips (horizontal scroll), sort dropdown, card per actor, "Load more"

### Graph UX Polish (if time permits)
- Loading state: skeleton during fetch, nodes drift into FA2 positions
- Empty filter state: centered card with filter chips + "Reset All Filters"
- Onboarding coach marks: 4 steps, localStorage tracking, skippable
- These are lower priority than the above items

### Claude's Discretion
- Exact toast component implementation (simple div or shadcn Sonner)
- SourceTooltip technical approach (shadcn Tooltip or custom)
- Mobile breakpoint details for table-to-card conversion
- Connection Explorer card layout details
- Graph loading animation specifics

</decisions>

<specifics>
## Specific Ideas

- OG images should feel like the dark-mode design system -- not generic white cards
- "Link kopiert" toast should be minimal (no close button, auto-dismiss)
- Conflict score must NOT use color coding -- "facts, not verdicts" principle
- The SourceTooltip dotted underline is the visual cue that a number is hoverable
- Party color bar on OG images creates instant visual identity per politician

</specifics>

<deferred>
## Deferred Ideas

- Two-column sticky sidebar layout for profiles -- defer to v1.x (aesthetic, not functional)
- Custom node shapes in graph (squircle, diamond, hexagon) -- defer to v1.x
- Edge line-style differentiation (dashed/dotted) -- defer to v1.x
- Node drag-to-pin / double-click-to-unpin -- defer to v1.x
- Graph onboarding coach marks -- lower priority, implement if time
- P2-01: GraphEventHandler infinite re-render loop -- needs fixing but separate from Phase 4 scope

</deferred>

---

*Phase: 04-sharing-filtering-and-polish*
*Context gathered: 2026-02-28*
