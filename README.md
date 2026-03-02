# Mandaetli.ch

Swiss political transparency platform that visualizes connections between politicians, parties, companies, and lobby groups. Built to make political networks accessible and understandable for everyone.

**Live:** [mandaetli.ch](https://mandaetli.ch)

## What it does

- **Interactive network graph** — explore relationships between 700+ political actors using a force-directed graph (Sigma.js + ForceAtlas2)
- **Filter and search** — filter by party, canton, council, industry, connection type, actor type, and confidence level
- **Path finding** — click two nodes to find the shortest connection path between any two actors
- **Profile pages** — detailed pages for politicians, organizations, and parties with connection breakdowns
- **Watchlist** — track specific actors and get notified about changes
- **Mobile-friendly** — card-based connection explorer on mobile, full graph on desktop

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Database:** Supabase (PostgreSQL)
- **Graph:** Sigma.js + Graphology + ForceAtlas2 layout
- **Styling:** Tailwind CSS 4
- **State:** Zustand + nuqs (URL search params)
- **UI:** Radix UI primitives
- **Linting:** Biome

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local Supabase)

### Setup

```bash
# Clone the repo
git clone https://github.com/PascalEugster/mandaetli.git
cd mandaetli

# Install dependencies
npm install

# Start local Supabase (Docker must be running)
npx supabase start

# Apply migrations and seed the database
npx supabase db reset

# Create env file from example
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Check linting and formatting (Biome)
npm run lint:fix     # Auto-fix lint and format issues
npx supabase start   # Start local Supabase
npx supabase stop    # Stop local Supabase
npx supabase db reset  # Reset DB (re-runs migrations + seed)
```

## Database

The project uses Supabase with 3 migrations in `supabase/migrations/`:

| Migration | Description |
|-----------|-------------|
| `00001_initial_schema.sql` | Core tables: actors, connections, data_sources, votes, vote_records |
| `00002_search_function.sql` | Full-text search function for actors |
| `00003_watchlist.sql` | Watchlist tables for actor tracking |

### Seeding

`supabase/seed.sql` contains the full dataset (~778 actors, ~2,284 connections). It runs automatically with `npx supabase db reset`.

To create a fresh dump from your local database:

```bash
docker exec supabase_db_mandaetli pg_dump -U postgres -d postgres \
  --schema=public --no-owner --no-privileges \
  --data-only --disable-triggers --inserts \
  2>/dev/null | grep -v '\\restrict\|\\unrestrict' > supabase/seed.sql
```

## Project structure

```
src/
  app/                    # Next.js App Router pages
    netzwerk/             # Network graph page
    person/               # Politician profiles
    organization/         # Organization profiles
    party/                # Party profiles
    suche/                # Search
    watchlist/            # Watchlist management
    api/                  # API routes
  components/
    graph/                # Graph visualization (Sigma.js)
    layout/               # Sidebar, TopBar, navigation
    profiles/             # Profile page components
    watchlist/            # Watchlist UI
    ui/                   # Shared UI primitives (Radix-based)
  lib/
    graph/                # Graph utilities, filters, styles, types
    supabase/             # Supabase client setup
  stores/                 # Zustand stores
supabase/
  migrations/             # SQL migrations
  seed.sql                # Database seed data
```

## Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork the repo** and create a feature branch from `main`
2. **Set up locally** following the [Getting started](#getting-started) instructions
3. **Make your changes** — keep PRs focused on a single feature or fix
4. **Check your code** before submitting:
   ```bash
   npm run lint        # Linting and formatting
   npm run build       # Make sure it builds
   ```
5. **Open a pull request** against `main` with a clear description of what you changed and why

### Areas where help is needed

- **Real data** — replacing mock data with verified public records (lobbywatch.ch, parlament.ch)
- **Translations** — French and Italian translations for the UI
- **Data quality** — improving confidence levels and source attribution
- **Accessibility** — screen reader support, keyboard navigation improvements
- **Tests** — unit and integration tests

### Database contributions

If you're adding or modifying data:

1. Make your changes via the Supabase Studio at [http://127.0.0.1:54333](http://127.0.0.1:54333) or through migrations
2. For schema changes, create a new migration:
   ```bash
   npx supabase migration new your_migration_name
   ```
3. For data changes, update the seed file:
   ```bash
   docker exec supabase_db_mandaetli pg_dump -U postgres -d postgres \
     --schema=public --no-owner --no-privileges \
     --data-only --disable-triggers --inserts \
     2>/dev/null | grep -v '\\restrict\|\\unrestrict' > supabase/seed.sql
   ```
4. Include both the migration and updated seed in your PR

## License

This project is open source. License TBD.
