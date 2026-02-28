# Plan 04-03 Summary: Mobile Responsiveness, Connection Explorer, Search Tabs

## Status: Complete

## What was built
- Mobile center-alignment on PersonHeader, OrgHeader, PartyHeader
- Responsive table columns: hide non-critical columns below md (Rolle/Bezahlt/Quelle, Rat/Thema, Kanton/Rat)
- ActorCard reusable component for mobile card layouts
- Person and Organization list pages: cards on mobile, tables on desktop
- "Im Netzwerk anzeigen" link replacing MiniEgoGraph on mobile profiles
- ConnectionExplorer component: mobile graph alternative with party filter chips, sort dropdown, paginated cards
- Netzwerk page switches between graph (md+) and ConnectionExplorer (below md)
- Search type filter tabs (Alle/Politiker:innen/Organisationen/Parteien) with URL persistence

## Key files
- `src/components/lists/ActorCard.tsx`
- `src/components/graph/ConnectionExplorer.tsx`
- `src/app/netzwerk/page.tsx`
- `src/app/suche/page.tsx`
- `src/components/search/SearchResults.tsx`

## Commit: 6571055
