# Plan 05-01 Summary: Watchlist and Alerts

## Status: Complete

## What was built
- Database schema: `watchlists` (email + unique token) and `watchlist_items` (actor references) tables
- Data access layer with getOrCreate, add, remove, getByToken operations
- POST/DELETE API routes at `/api/watchlist` for subscribe/unsubscribe
- WatchButton component with inline email form, toast feedback, management link
- WatchlistManager component with actor cards and remove functionality
- Watchlist management page at `/watchlist/[token]` with masked email display
- WatchButton added to all three profile pages (person, organization, party)
- DSG-compliant: stores only email + actor IDs, no additional personal data
- Email notifications simulated via console.log (production service TBD)

## Key files
- `supabase/migrations/00003_watchlist.sql`
- `src/lib/data/watchlist.ts`
- `src/app/api/watchlist/route.ts`
- `src/components/watchlist/WatchButton.tsx`
- `src/components/watchlist/WatchlistManager.tsx`
- `src/app/watchlist/[token]/page.tsx`

## Commit: c144b36
