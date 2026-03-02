# Stack Research

**Domain:** Political transparency platform with interactive network graph visualization
**Researched:** 2026-02-27
**Confidence:** HIGH (core stack) / MEDIUM (supporting libraries — versions verified via npm/official docs, some ecosystem patterns from web search only)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.x | Full-stack React framework | Latest stable (Dec 2025). Turbopack default bundler (2-5x faster builds), Cache Components for instant navigation with PPR, `proxy.ts` replaces middleware. SSR critical for SEO — journalists/citizens will share links to politician profiles. React 19.2 support with View Transitions and Activity components. |
| React | 19.2.x | UI library | Ships with Next.js 16. View Transitions for smooth graph-to-profile navigation. Activity component for pre-rendering background views. React Compiler stable for automatic memoization — critical for graph-heavy re-renders. |
| TypeScript | 5.5+ | Type safety | Required by Next.js 16 (min 5.1). Use 5.5+ for Zod v4 compatibility. Strong typing essential for complex graph data models (actors, connections, confidence levels). |
| Tailwind CSS | 4.2.x | Styling | CSS-first config (no `tailwind.config.js`), up to 100x faster incremental builds. Dark-mode-first via `dark:` variant aligns with Palantir-style design requirement. First-class container queries for responsive graph panels. |
| Supabase | JS SDK 2.97.x | Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime) | Covers auth, database, real-time subscriptions, file storage, and auto-generated REST API in one package. PostgreSQL sufficient for Swiss political graph scale (~246 politicians + ~5000 org connections). Row-Level Security for future public API. PostgREST v14 with ~20% RPS improvement. |
| @supabase/ssr | 0.8.x | Server-side Supabase client for Next.js | Official SSR package replacing deprecated `@supabase/auth-helpers-nextjs`. Creates server/browser clients for App Router with cookie-based sessions. Required for Server Components data fetching. |

### Graph Visualization Stack

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| sigma | 3.0.x | WebGL graph renderer | Purpose-built for large network graphs. WebGL rendering handles thousands of nodes/edges smoothly — critical for 246+ politicians with thousands of connections. Dramatically outperforms D3 (SVG) and Cytoscape for this scale. Works in symbiosis with graphology. |
| graphology | 0.26.x | Graph data structure & algorithms | Multipurpose graph manipulation library. Provides typed graph objects, traversal algorithms, metrics (centrality, community detection), and serialization. The data layer that sigma renders. Stable API despite 0.x version. |
| @react-sigma/core | 5.0.x | React bindings for sigma | Official React wrapper. Hooks-based API (`useSigma`, `useRegisterEvents`, `useLoadGraph`). Supports React 19. Eliminates manual DOM management for graph lifecycle. |
| graphology-layout-forceatlas2 | 0.10.x | Force-directed graph layout | ForceAtlas2 algorithm for natural-looking network layouts. Web Worker support for non-blocking layout computation. Barnes-Hut approximation for O(n*log(n)) repulsion — essential for smooth UI during layout animation. |
| graphology-communities-louvain | 0.8.x | Community detection | Louvain algorithm detects clusters (party affiliations, industry groups) automatically. Enables color-coding and grouping of related actors in the graph. |
| graphology-metrics | 0.7.x | Graph metrics (centrality, degree) | Computes betweenness centrality, degree distribution — powers "most connected politician" rankings and conflict-of-interest scoring. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.x | Client-side data fetching, caching, mutations | All client-side data fetching beyond initial Server Component render. Background refetching for live data, optimistic updates for watchlist actions. Pairs with Supabase client queries. |
| zustand | 5.0.x | Client-side state management | Graph UI state: selected nodes, active filters, zoom level, sidebar state. No provider needed. ~3KB. Use for cross-component state that doesn't belong in URL. |
| nuqs | 2.8.x | URL search params state | All shareable view state: active filters, selected politician, graph view mode, search query. Type-safe URL params critical for "shareable links for any view" requirement. Only 6KB. |
| zod | 4.3.x | Schema validation & type inference | API response validation, form validation, URL param parsing (with nuqs). v4 is 14x faster string parsing, built-in `.toJSONSchema()` for future public API docs. Use @zod/mini (~1.9KB) for client-only validation. |
| next-intl | 4.8.x | Internationalization (i18n) | German primary, French/Italian secondary. ICU message syntax, App Router native, Server Components support. Add in Phase 2+ — not MVP but architecture should account for it from day one. |
| d3-sankey | 0.12.x | Sankey diagram layout | Campaign financing flow visualization specifically. D3-sankey computes node/link positions; render with React SVG. Only needed for the financing Sankey feature, not the main network graph. |
| d3-scale + d3-color | 7.x / 3.x | Color scales, data mapping | Heatmap color gradients (party/industry matrix), graph node sizing by metric value. Import only what you need — D3 is fully modular. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Biome | Linting + formatting (single tool) | 10-25x faster than ESLint + Prettier. Single binary, one config file. Next.js 16 removed `next lint` — Biome is the natural replacement. Handles JS/TS/JSX/TSX formatting and linting. Use `biome.json` at project root. |
| Vitest | Unit + component testing | v4.0.x with stable Browser Mode. Native ESM, Turbopack-compatible. Use with `@vitejs/plugin-react` for component tests. Playwright Traces integration for debugging. |
| Playwright | E2E testing | v1.58.x. Test full graph interaction flows, shareable link generation, filter behavior. Official Next.js recommendation. |
| @tanstack/react-query-devtools | Query debugging | Inspect cached queries, mutation state. Essential during development with complex Supabase data fetching patterns. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| sigma + graphology | D3.js force-directed graph | Only if you need pixel-perfect custom rendering control and your graph is < 200 nodes. D3 uses SVG — performance degrades above ~500 nodes. Our graph will exceed this. |
| sigma + graphology | Cytoscape.js | If you need built-in graph analysis algorithms without a separate library. Cytoscape bundles layout + rendering + analysis. But it's heavier, less performant for rendering, and the React integration (@cytoscape/react) is less mature than @react-sigma. |
| sigma + graphology | vis-network | If you want the simplest possible setup with zero configuration. vis-network has the gentlest learning curve but limited customization and weaker performance at scale. |
| sigma + graphology | Neo4j + commercial viz (e.g., Ogma, KeyLines) | If graph scale exceeds ~50K nodes or you need server-side graph traversal. For Swiss political data (~5K entities), PostgreSQL + client-side sigma is sufficient. Neo4j can be added later as a read-optimized layer if needed. |
| Supabase (PostgreSQL) | Neo4j as primary database | Only if graph traversal queries become the bottleneck. PostgreSQL WITH RECURSIVE CTEs handle multi-hop queries well at this scale. Supabase gives auth/storage/realtime that Neo4j doesn't — you'd need both anyway. |
| zustand | Jotai | If state is highly atomic and independent (many small pieces). Our graph state is more interconnected (filters affect nodes affect sidebar) — zustand's centralized store is clearer. |
| zustand | Redux Toolkit | If you have 5+ developers and need strict action/reducer patterns for auditability. Overkill for this project's state complexity. |
| Biome | ESLint + Prettier | If you need specialized ESLint plugins (e.g., eslint-plugin-security, custom accessibility rules) that Biome doesn't cover yet. Biome lacks HTML/Markdown formatting. |
| next-intl | next-translate, i18next | If you need framework-agnostic i18n (e.g., sharing translations with React Native). next-intl is purpose-built for Next.js App Router — tighter integration, smaller bundle. |
| @tanstack/react-query | SWR | If your data fetching is simple GET-only with no mutations. SWR is lighter but lacks mutation management, query invalidation patterns, and devtools quality. Our app has complex data relationships. |
| Tailwind CSS 4 | CSS Modules | If you have an existing large CSS Modules codebase. For greenfield, Tailwind 4 with shadcn/ui provides the fastest path to a consistent, dark-mode-first design system. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` | Deprecated. No longer receiving bug fixes or features. | `@supabase/ssr` — official replacement with App Router support |
| D3.js for the main network graph | SVG-based rendering chokes above ~500 nodes. Our graph needs 246+ politicians plus thousands of org nodes simultaneously. Interaction (hover, zoom, filter) becomes janky. | sigma (WebGL) + graphology for the network graph. Use D3 modules only for charts (Sankey, heatmaps) where node count is low. |
| vis-network / vis.js | Unmaintained original repo (last commit 2020+). Community fork `vis-network` has limited TypeScript support and poor React integration. | sigma + @react-sigma/core |
| react-force-graph / 3d-force-graph | 3D graph visualization is disorienting for non-technical users. Swiss citizens need clear, scannable 2D layouts — not a rotatable 3D globe. Also heavy bundle size. | sigma (2D WebGL) with ForceAtlas2 layout |
| Chart.js / react-chartjs-2 | Canvas-based, limited to standard chart types. No Sankey support. Less composable than D3 modules for our custom viz needs (heatmaps, conflict scores). | D3 modules (d3-sankey, d3-scale) rendered via React SVG, or Recharts for simple charts |
| Prisma ORM | Adds an abstraction layer over Supabase's auto-generated client. Supabase JS SDK already provides typed database access. Prisma would duplicate the schema definition and conflict with Supabase's Row-Level Security patterns. | `@supabase/supabase-js` with TypeScript types generated via `supabase gen types` |
| NextAuth.js / Auth.js | Supabase Auth is already included. Adding a separate auth layer creates session management conflicts and doubles complexity. Supabase Auth handles OAuth, magic links, and RLS integration natively. | Supabase Auth via `@supabase/ssr` |
| styled-components / Emotion | CSS-in-JS has performance overhead in Server Components (requires client boundary). Tailwind 4 + shadcn/ui provides utility-first styling with zero runtime cost. | Tailwind CSS 4 + shadcn/ui |
| Redux Toolkit | Excessive boilerplate for this project's state complexity. The graph UI state (selected node, filters, zoom) doesn't need actions, reducers, and middleware. | zustand for client state, nuqs for URL state |
| ESLint + Prettier (as separate tools) | Next.js 16 removed `next lint`. Maintaining two config files + integration plugins is unnecessary overhead when Biome handles both. 10-25x slower than Biome. | Biome |
| `middleware.ts` | Deprecated in Next.js 16. Will be removed in a future version. | `proxy.ts` — same API, renamed for clarity, runs on Node.js runtime |

## Stack Patterns by Variant

**If graph performance becomes an issue at scale (>5K nodes rendered):**
- Enable graphology-layout-forceatlas2 web worker for background layout computation
- Use sigma's edge rendering optimization (curved edges off, reduced edge labels)
- Consider graphology-layout-noverlap for node overlap prevention
- Last resort: server-side graph pre-computation with PostgreSQL + pg_graphql

**If real-time collaboration is needed (multiple journalists viewing same graph):**
- Use Supabase Realtime channels for cursor/selection sync
- Broadcast graph filter state via Supabase Presence
- This is NOT in MVP scope but Supabase makes it trivial to add later

**If public API demand exceeds Supabase free tier:**
- Supabase auto-generates a PostgREST API — expose directly with API key restrictions
- Add rate limiting via `proxy.ts` (Next.js 16's replacement for middleware)
- Consider Supabase Edge Functions for computed endpoints (e.g., "top 10 most connected politicians")

**If AI analysis layer is prioritized (Claude integration):**
- Use Vercel AI SDK (`ai` package) for streaming responses
- Supabase Edge Functions as the LLM gateway (keeps API keys server-side)
- Store AI-generated summaries in Supabase with `ai_generated: true` flag and confidence level

## UI Component Library

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | latest (CLI 3.x) | Pre-built accessible components | Not a package — copies component source into your project. Full customization control. Built on Radix UI primitives. Dark-mode-first with Tailwind. Used by 100K+ GitHub stars ecosystem. Perfect for data-dense dashboards: tables, command palettes, sheets, popovers. |
| Radix UI | (via shadcn/ui) | Accessible headless primitives | Provides WAI-ARIA compliant dialog, popover, dropdown, tooltip, etc. Zero styling opinions — styled via Tailwind. Keyboard navigation built-in — critical for accessibility requirement. |
| cmdk | 1.x | Command palette (Cmd+K search) | Powers the global search across all actors/connections. shadcn/ui includes a `<CommandDialog>` built on cmdk. Fuzzy search, keyboard navigation, extensible groups. |
| lucide-react | latest | Icon library | Default icon set for shadcn/ui. Tree-shakable, consistent style. MIT licensed. |
| recharts | 2.x | Simple charts (bar, line, pie) | For voting analysis charts, party comparison bar charts. Simpler API than D3 for standard chart types. Use alongside D3 modules for complex viz (Sankey, heatmaps). |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.1.x | react@19.2.x, react-dom@19.2.x | Next.js 16 requires React 19.2+. Install together. |
| next@16.1.x | typescript@5.1+ | Min 5.1, recommend 5.5+ for Zod v4 |
| next@16.1.x | node@20.9+ | Node.js 18 dropped. Use 20 LTS or 22 LTS. |
| tailwindcss@4.2.x | next@16.1.x | Zero-config with Next.js 16 template. CSS-first import: `@import "tailwindcss"` |
| sigma@3.0.x | graphology@0.25+ | sigma 3.x depends on graphology as peer dependency |
| @react-sigma/core@5.0.x | sigma@3.0.x, react@19.x | Verified: React 19 support in latest release |
| @supabase/ssr@0.8.x | @supabase/supabase-js@2.97.x | SSR package wraps supabase-js for cookie management |
| zod@4.3.x | typescript@5.5+ | Zod v4 tested against TS 5.5+. Older versions may work but unsupported. |
| zustand@5.0.x | react@18+ | Zustand 5 supports React 18 and 19. No provider required. |
| vitest@4.0.x | @vitejs/plugin-react | Vite-native. Use `@vitejs/plugin-react` for JSX transform in tests. |
| next-intl@4.8.x | next@14.2+ | Supports Next.js 14-16. App Router + Server Components. |

## Installation

```bash
# Core framework
npm install next@latest react@latest react-dom@latest

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Graph visualization
npm install sigma graphology @react-sigma/core
npm install graphology-layout-forceatlas2 graphology-communities-louvain graphology-metrics
npm install graphology-types  # TypeScript types for graphology

# UI components (shadcn/ui is added via CLI, not npm)
npx shadcn@latest init
npm install lucide-react recharts cmdk

# Data layer
npm install @tanstack/react-query zustand nuqs zod

# Internationalization (add when needed, not MVP)
# npm install next-intl

# D3 modules for specialized charts (add when needed)
# npm install d3-sankey d3-scale d3-color

# Dev dependencies
npm install -D typescript @types/react @types/react-dom
npm install -D tailwindcss @tailwindcss/postcss
npm install -D @biomejs/biome
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D @tanstack/react-query-devtools
npm install -D supabase  # CLI for type generation: supabase gen types
```

## Sources

- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — Version, features, breaking changes (HIGH confidence)
- [Next.js 16.1 release blog](https://nextjs.org/blog/next-16-1) — Turbopack FS caching stable (HIGH confidence)
- [Supabase changelog](https://supabase.com/changelog) — PostgREST v14, recent features (HIGH confidence)
- [supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — v2.97.0 verified (HIGH confidence)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) — v0.8.0 verified (HIGH confidence)
- [sigma npm](https://www.npmjs.com/package/sigma) — v3.0.2 verified (HIGH confidence)
- [graphology npm](https://www.npmjs.com/package/graphology) — v0.26.0 verified (HIGH confidence)
- [@react-sigma/core npm](https://www.npmjs.com/package/@react-sigma/core) — v5.0.6 verified (HIGH confidence)
- [Sigma.js official site](https://www.sigmajs.org/) — WebGL performance claims (HIGH confidence)
- [Graphology docs — ForceAtlas2](https://graphology.github.io/standard-library/layout-forceatlas2.html) — Web Worker support, Barnes-Hut (HIGH confidence)
- [Tailwind CSS v4.0 blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, performance (HIGH confidence)
- [tailwindcss npm](https://www.npmjs.com/package/tailwindcss) — v4.2.1 verified (HIGH confidence)
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — CLI 3.0, 100K+ stars (HIGH confidence)
- [Zod v4 release notes](https://zod.dev/v4) — Performance improvements, @zod/mini (HIGH confidence)
- [zod npm](https://www.npmjs.com/package/zod) — v4.3.6 verified (HIGH confidence)
- [zustand npm](https://www.npmjs.com/package/zustand) — v5.0.11 verified (HIGH confidence)
- [nuqs npm](https://www.npmjs.com/package/nuqs) — v2.8.8 verified, Next.js Conf 2025 talk (HIGH confidence)
- [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query) — v5.90.21 verified (HIGH confidence)
- [TanStack Query SSR docs](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) — Next.js App Router integration (HIGH confidence)
- [next-intl npm](https://www.npmjs.com/package/next-intl) — v4.8.3 verified (HIGH confidence)
- [React 19.2 announcement](https://react.dev/blog/2025/10/01/react-19-2) — View Transitions, Activity, useEffectEvent (HIGH confidence)
- [Vitest 4.0 blog](https://vitest.dev/blog/vitest-4) — Browser Mode stable, Playwright Traces (HIGH confidence)
- [vitest npm](https://www.npmjs.com/package/vitest) — v4.0.18 verified (HIGH confidence)
- [Playwright npm](https://www.npmjs.com/package/playwright) — v1.58.2 verified (HIGH confidence)
- [Biome vs ESLint comparison](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/) — Performance benchmarks (MEDIUM confidence)
- [Graph visualization library comparison — Cylynx](https://www.cylynx.io/blog/a-comparison-of-javascript-graph-network-visualisation-libraries/) — sigma vs D3 vs Cytoscape performance (MEDIUM confidence)
- [Zustand vs Jotai comparison](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025) — State management selection rationale (MEDIUM confidence)

---
*Stack research for: Mandaetli.ch — Swiss political transparency platform*
*Researched: 2026-02-27*
