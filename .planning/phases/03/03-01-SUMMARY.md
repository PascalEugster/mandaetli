---
phase: "03"
plan: 01
status: complete
completed_at: "2026-02-27"
---

# Plan 03-01 Summary: Data Layer, Search, and Conflict Score

## What was built

### Task 1: Search function migration and data query modules

**Migration** (`supabase/migrations/00002_search_function.sql`):
- `search_actors` PostgreSQL function using `pg_trgm` similarity + ILIKE fallback
- Returns actor metadata with similarity score, ordered by relevance
- Verified: `SELECT * FROM search_actors('Muller', 5)` returns correct fuzzy matches

**Data query modules** (6 files in `src/lib/data/`):

| Module | Exports | Notes |
|--------|---------|-------|
| `connections.ts` | `getConnectionsForActor`, `ConnectionWithActor` type | Bidirectional: handles source or target |
| `votes.ts` | `getVoteRecordsForPerson`, `VoteRecordWithVote` type | Joins vote_records with votes table |
| `persons.ts` | `getPersonBySlug`, `getPersonConnections`, `getPersonVoteRecords`, `getPersonCommissions`, `listPersons` | Filters: party, canton, council |
| `organizations.ts` | `getOrgBySlug`, `getOrgConnections`, `listOrganizations` | Filter: industry |
| `parties.ts` | `getPartyBySlug`, `getPartyMembers`, `getPartyConnectionStats`, `listParties` | Stats: industry connection counts |
| `search.ts` | `searchActors`, `SearchResult` type | Uses browser Supabase client |

### Task 2: Conflict-of-interest score algorithm

**File**: `src/lib/utils/conflict-score.ts`
- `TOPIC_TO_INDUSTRY` mapping: 12 topic categories to industry arrays
- `calculateConflictScore`: pure function, no side effects
- Algorithm: overlap between connected org industries and vote topic industries
- Types: `ConflictVote`, `ConflictScoreResult`

## Verification

- `npx supabase db reset --local` + `npx tsx supabase/seed.ts`: clean apply
- `npx tsc --noEmit`: passes
- `npx @biomejs/biome check src/`: passes
- `npm run build`: passes
- DB search test: confirmed working with seeded data
- `database.ts` regenerated: includes `search_actors` RPC type

## Files created/modified

| File | Action |
|------|--------|
| `supabase/migrations/00002_search_function.sql` | Created |
| `src/lib/data/connections.ts` | Created |
| `src/lib/data/votes.ts` | Created |
| `src/lib/data/persons.ts` | Created |
| `src/lib/data/organizations.ts` | Created |
| `src/lib/data/parties.ts` | Created |
| `src/lib/data/search.ts` | Created |
| `src/lib/utils/conflict-score.ts` | Created |
| `src/types/database.ts` | Regenerated (includes search_actors RPC) |
