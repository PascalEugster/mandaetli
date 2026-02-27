---
phase: "03"
plan: 02
status: complete
completed_at: "2026-02-27"
---

# Plan 03-02 Summary: Profile UI Components and Mini Ego-Graph

## What was built

### Task 1: Profile headers and table components (7 files)

| Component | File | Key Features |
|-----------|------|--------------|
| SortableHeader | `src/components/lists/SortableHeader.tsx` | Reusable sort toggle with ChevronUp/Down icons |
| PersonHeader | `src/components/profiles/PersonHeader.tsx` | Photo, name, party/canton/council badges, commissions, connection count |
| OrgHeader | `src/components/profiles/OrgHeader.tsx` | Name, industry badge, legal form, HQ, website link, UID |
| PartyHeader | `src/components/profiles/PartyHeader.tsx` | Name, abbreviation, color swatch, ideology bar, seats, founded |
| ConnectionList | `src/components/profiles/ConnectionList.tsx` | Sortable table with confidence badges (colored dots), source links |
| VotingRecord | `src/components/profiles/VotingRecord.tsx` | Sortable table with decision badges (green/red/yellow/gray) |
| PartyMembers | `src/components/profiles/PartyMembers.tsx` | Sortable member list with nuqs URL state persistence |

### Task 2: Graph, score, and heatmap components (3 files)

| Component | File | Key Features |
|-----------|------|--------------|
| MiniEgoGraph | `src/components/profiles/MiniEgoGraph.tsx` | Sigma.js + synchronous FA2 (200 iterations), click-to-navigate, MultiGraph |
| ConflictScore | `src/components/profiles/ConflictScore.tsx` | Score %, expandable methodology, topic-to-industry reference table, overlapping votes list |
| IndustryHeatmap | `src/components/profiles/IndustryHeatmap.tsx` | CSS grid, party-colored cells with opacity proportional to count, tooltips |

## Verification

- `npx tsc --noEmit`: passes
- `npx @biomejs/biome check src/components/profiles/ src/components/lists/`: passes
- `npm run build`: passes (no SSR issues; MiniEgoGraph is not yet used in any page)
- All 10 component files exist and export their primary component

## Design system usage

All components use the established design tokens:
- Surfaces: bg-surface-0, bg-surface-1, bg-surface-2
- Text: text-text-primary, text-text-secondary, text-text-muted
- Borders: border-border-subtle
- Accent: text-swiss-red
- Confidence colors: CSS variables (--color-confidence-verified, etc.)

## Files created

| File | Lines |
|------|-------|
| `src/components/lists/SortableHeader.tsx` | 37 |
| `src/components/profiles/PersonHeader.tsx` | 63 |
| `src/components/profiles/OrgHeader.tsx` | 45 |
| `src/components/profiles/PartyHeader.tsx` | 53 |
| `src/components/profiles/ConnectionList.tsx` | 119 |
| `src/components/profiles/VotingRecord.tsx` | 103 |
| `src/components/profiles/PartyMembers.tsx` | 109 |
| `src/components/profiles/MiniEgoGraph.tsx` | 154 |
| `src/components/profiles/ConflictScore.tsx` | 115 |
| `src/components/profiles/IndustryHeatmap.tsx` | 83 |
