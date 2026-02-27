# Feature Research

**Domain:** Political transparency and lobbying disclosure platform (Swiss focus)
**Researched:** 2026-02-27
**Confidence:** MEDIUM — based on analysis of 8+ active platforms; Swiss-specific features verified against Lobbywatch.ch and parlament.ch; some emerging AI features at LOW confidence

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. Derived from what every serious platform in this space provides.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Politician profile pages** | Every platform (OpenSecrets, TheyWorkForYou, Lobbywatch, Abgeordnetenwatch) has dedicated pages per representative. Users navigate politician-first. | MEDIUM | Must include: name, party, canton, commission memberships, photo, declared interests (Interessenbindungen). This is the atomic unit of the platform. |
| **Declared interests (Interessenbindungen) list** | Core of Swiss transparency law. Lobbywatch.ch's entire value proposition. Users come specifically for this. | MEDIUM | Must show organization name, role (VR, Beirat, Stiftungsrat), compensation status (paid/unpaid), and source link back to parlament.ch. |
| **Global search** | OpenSecrets, LittleSis, TheyWorkForYou, Lobbywatch all provide search. Users expect to type a name and get results instantly. | MEDIUM | Must search across politicians, organizations, and companies. Autocomplete is expected. |
| **Organization/company profile pages** | LittleSis, OpenSecrets, and Lobbywatch all have entity profiles. Users want to see "who sits on this company's board?" | MEDIUM | Show all connected politicians, board members, lobbyist affiliations. Reverse lookup from politician profiles. |
| **Source attribution and transparency** | Every credible platform cites sources. Lobbywatch verifies journalistically. OpenSecrets cites FEC/Senate records. Users distrust unsourced claims. | LOW | Every connection must link to its source (parlament.ch, Zefix, Lobbywatch). Confidence level (verified, declared, inferred) per connection. |
| **Filtering and faceted navigation** | OpenSecrets filters by industry/issue/state. Lobbywatch filters by party/canton/commission. Standard UX pattern. | MEDIUM | Filter by: party, canton, council (National/Staenderat), commission, industry sector. Combinable filters. |
| **Shareable URLs / permalinks** | TheyWorkForYou pioneered permalink-per-debate. Every modern platform supports sharing a specific view. Core for journalist workflow. | LOW | Every profile, every search result, every graph state must have a unique URL that reproduces the exact view. |
| **Responsive / mobile-usable design** | Modern web standard. TheyWorkForYou is mobile-friendly. Journalists check on phones. | MEDIUM | Full graph interaction won't work on mobile, but profile pages, search, and lists must be fully usable. Progressive disclosure pattern. |
| **Data freshness indicators** | Lobbywatch updates weekly. Users need to know when data was last synced. Stale data without disclosure destroys trust. | LOW | Show "last updated" timestamps per data source and per entity. |
| **Public API** | OpenSecrets (discontinued 2025 but was core for years), Lobbywatch, TheyWorkForYou, Parltrack all offer APIs. Researcher and journalist audience expects programmatic access. | MEDIUM | REST/JSON API. Rate-limited. Enables external analysis, academic use, and media integrations. |

### Differentiators (Competitive Advantage)

Features that set Seilschaften.ch apart. Not expected (no existing Swiss platform does these), but high value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Interactive network graph visualization** | LittleSis has Oligrapher but it is editor-focused, not exploration-focused. No Swiss platform visualizes the full network interactively. This is the core differentiator: see the web of connections at a glance. | HIGH | Force-directed graph (D3/Sigma.js). Must handle 246+ politicians + thousands of org nodes. Zoom, pan, click-to-expand, highlight paths. Performance is critical. |
| **Cross-register data fusion** | No existing tool connects parlament.ch + Zefix + Lobbyregister + campaign finance into one view. Lobbywatch covers only parliamentary lobbying. OpenSecrets is US-only. This cross-referencing is the core value proposition. | HIGH | Requires ETL pipelines per data source. Entity resolution across registers (same company, different names). Data model must accommodate multiple source types. |
| **Conflict-of-interest scoring on votes** | No Swiss platform scores votes against declared interests. OpenSecrets shows who funds whom but does not algorithmically flag conflicts. This makes abstract connections concrete. | HIGH | Requires voting data + interest data + industry classification. Algorithm must be transparent and auditable. Risk of perceived bias — methodology page essential. |
| **Campaign finance flow visualization (Sankey)** | Swiss campaign finance transparency law (since 2021) created new data but no tool visualizes it well. Sankey diagrams make money flows intuitive. OpenSecrets uses bar charts; a Sankey is more powerful for showing source-to-recipient flows. | HIGH | Depends on Eidg. Kanzlei data availability. Sankey libraries (D3-sankey) exist but need careful UX for complex flows. |
| **Dark-mode intelligence dashboard aesthetic** | Most civic tech platforms look dated (TheyWorkForYou, Lobbywatch, Parltrack). A Palantir-inspired design signals seriousness and builds trust for intensive research sessions. Visual differentiation is immediate. | MEDIUM | Design system investment. Swiss red accent on dark background. Data-dense layouts with clear hierarchy. Not just dark-mode-as-toggle but dark-mode-as-identity. |
| **AI-powered natural language queries** | European Parliament has experimental NLP search. No Swiss platform offers this. "Which parliamentarians have connections to the insurance industry?" as a query is transformative for non-expert users. | HIGH | Requires Claude/LLM integration. Must generate accurate structured queries from natural language. Risk of hallucination — must show underlying data, not just AI summary. |
| **Party-level and industry-level aggregation heatmaps** | No existing platform shows "which party is most connected to which industry" as a heatmap. Aggregated views turn individual data points into systemic insights. | MEDIUM | Requires industry classification of organizations. Matrix/heatmap visualization. Powerful for journalists writing systemic stories. |
| **Watchlist with email alerts** | TheyWorkForYou's alert system is its most-used feature by civil society. Parltrack offers dossier notifications. No Swiss platform offers this for politician-interest changes. | MEDIUM | Track specific politicians or organizations. Email when new connections declared, votes cast, or data changes. Requires background job infrastructure. |
| **Annotation and storytelling layer** | LittleSis Oligrapher's annotation feature is unique: overlay narrative on network graphs. Journalists could create guided tours of connection networks for articles. | HIGH | Editor UI for creating annotation sequences. Embed-friendly output. Content moderation considerations if user-generated. |
| **Data export for journalists** | Lobbywatch offers CSV/JSON/GraphML. OpenSecrets had bulk downloads. Journalists need to pull data into their own tools (Excel, Gephi, R). | LOW | CSV, JSON, and potentially GraphML export for graph data. Print-optimized views for screenshots. |
| **Linked Open Data (LOD)** | Lobbywatch has LOD via zazuko. Standards-compliant RDF/SPARQL makes data interoperable with academic and government datasets. | MEDIUM | R2RML mappings from PostgreSQL. SPARQL endpoint. Positions platform as authoritative data source in Swiss open data ecosystem. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **User accounts for general public** | "Let users save searches and preferences" | Adds auth complexity, GDPR/DSG obligations, password resets, account management. Overkill for a transparency tool where 90% of users visit once via a shared link. | Shareable URLs encode all state. Watchlist/alerts for power users only (email-only, no password). Cookie-based recent history. |
| **Crowd-sourced data entry** | LittleSis does this. "Let citizens report connections." | Data quality collapses without heavy moderation. Lobbywatch employs journalists to verify. Unverified crowd data undermines the platform's credibility as a factual source. Legal liability for false claims about politicians. | Structured error reporting form ("this connection is wrong/missing"). Team reviews and updates from official sources only. |
| **Political commentary or editorial content** | "Add context about why connections matter" | Instantly perceived as political bias. Destroys the platform's neutrality positioning. Every Swiss party would attack it. | Let the data speak. Provide tools for journalists to draw their own conclusions. Methodology page explains what the data means, not what to think. |
| **Real-time data / live updates** | "Show changes as they happen" | Parliamentary data changes slowly (sessions, not seconds). Real-time infrastructure (WebSockets, SSE) adds massive complexity for negligible user value. Lobbywatch updates weekly and that is sufficient. | Daily or weekly batch sync. Show "last updated" timestamps. Alert system notifies on meaningful changes. |
| **Social features (comments, discussions, forums)** | "Let users discuss what they find" | Moderation nightmare. Off-topic political arguments. Platform becomes a battleground instead of a reference tool. Completely outside core value. | Share-to-Twitter/Reddit/email links. Let discussion happen on existing social platforms. |
| **Cantonal parliament data (v1)** | "Cover all Swiss politics, not just federal" | 26 cantons with different data formats, different transparency laws, different register structures. Multiplies data engineering work by 10x for a fraction of the user interest. | Explicit Phase 5+ deferral. Federal level first. Architecture should not preclude cantonal expansion but must not be designed around it. |
| **ML-based media scraping for connections** | "Automatically find undeclared connections from news articles" | Legal risk (copyright, defamation). Accuracy problems. "AI says politician X is connected to company Y based on a newspaper article" is not the same as an official declaration. Undermines the platform's data quality promise. | Manual research by Lobbywatch partnership. Clearly label any media-sourced connections as "media-reported" with link to source article. |
| **Predictive analytics / "corruption risk scores"** | "Score politicians on likelihood of corruption" | Defamation risk. Methodological controversy. Reduces nuanced relationships to a single number. Political weapon rather than transparency tool. | Show the connections factually. Let users form their own conclusions. Conflict-of-interest scoring on specific votes (transparent methodology) is different from a global "corruption score." |
| **Historical data archive (v1)** | "Show how connections changed over time" | Requires temporal data modeling, versioning, and significantly more storage/complexity. Official sources often don't provide historical snapshots. | Current legislature only for v1. Architecture should support temporal data (valid_from/valid_to on connections) but UI shows current state only. Historical views in v2+. |

## Feature Dependencies

```
[Data Import Pipeline (parlament.ch)]
    +--requires--> [Politician Profile Pages]
    |                  +--requires--> [Global Search]
    |                  +--requires--> [Filtering & Faceted Navigation]
    |                  +--enables---> [Shareable URLs]
    |
    +--requires--> [Organization Profile Pages]
    |                  +--enables---> [Cross-register Data Fusion]
    |
    +--enables---> [Interactive Network Graph]
                       +--enhances--> [Party/Industry Heatmaps]
                       +--enhances--> [Annotation & Storytelling Layer]

[Zefix/Handelsregister Integration]
    +--requires--> [Entity Resolution Engine]
    +--enables---> [Cross-register Data Fusion]

[Voting Data Import]
    +--requires--> [Politician Profile Pages]
    +--enables---> [Conflict-of-Interest Scoring]

[Campaign Finance Data Import]
    +--enables---> [Sankey Flow Visualization]

[Global Search]
    +--enhances--> [AI Natural Language Queries]

[Email Infrastructure]
    +--requires--> [Watchlist System]
    +--requires--> [Data Change Detection]

[Public API]
    +--requires--> [Stable Data Model]
    +--enables---> [Data Export]
    +--enables---> [Linked Open Data]
```

### Dependency Notes

- **Politician Profile Pages require Data Import Pipeline:** Without real (or mock) data, profiles are empty shells. The mock data system enables parallel frontend/backend development.
- **Cross-register Data Fusion requires Entity Resolution:** The same organization appears differently in parlament.ch ("Economiesuisse") and Zefix ("economiesuisse"). Fuzzy matching or manual mapping is required.
- **Conflict-of-Interest Scoring requires both Voting Data AND Interest Data:** Cannot score votes without knowing both how someone voted and what interests they declared. Both pipelines must exist.
- **AI Natural Language Queries enhance Global Search:** NLQ is a layer on top of structured search, not a replacement. Must fall back to structured search when AI interpretation is uncertain.
- **Network Graph is independent of specific data sources:** Can render whatever data exists. More data sources = richer graph, but the graph works with parlament.ch data alone.
- **Annotation/Storytelling conflicts with v1 scope:** Requires significant editor UI work. Defer unless journalist partnerships demand it early.

## MVP Definition

### Launch With (v1)

Minimum viable product — what is needed to validate the core value proposition: "Find and understand any National Council member's economic connections in under 2 minutes."

- [ ] **Data import from parlament.ch** — 246 council members with declared Interessenbindungen. This is the atomic dataset.
- [ ] **Politician profile pages** — Name, party, canton, photo, all declared interests with source links. The landing page for any shared link.
- [ ] **Organization profile pages** — Reverse lookup: which politicians are connected to this org.
- [ ] **Interactive network graph** — The visual differentiator. Even with just parlament.ch data, seeing the web of connections is powerful.
- [ ] **Global search with autocomplete** — Users must find any politician or org instantly.
- [ ] **Filtering by party, canton, council** — Basic faceted navigation for exploration.
- [ ] **Shareable URLs for all views** — Journalists share links. Without this, the platform cannot spread.
- [ ] **Source attribution on every connection** — Trust requires provenance. Every link back to parlament.ch.
- [ ] **Responsive design (mobile-readable profiles)** — Graph can be desktop-only in v1, but profiles must work everywhere.
- [ ] **Dark-mode design system** — The aesthetic identity. Build it from day one, not retrofitted.

### Add After Validation (v1.x)

Features to add once core is working and initial users provide feedback.

- [ ] **Zefix/Handelsregister integration** — Trigger: core graph works, users ask "but what companies do they actually run?"
- [ ] **Party-level and industry heatmaps** — Trigger: journalists want systemic stories, not just individual profiles
- [ ] **Watchlist with email alerts** — Trigger: repeat visitors want to monitor specific politicians
- [ ] **Public API (v1)** — Trigger: researchers and developers request programmatic access
- [ ] **Data export (CSV/JSON)** — Trigger: journalists want to pull data into their own tools
- [ ] **Voting record display** — Trigger: parlament.ch voting data pipeline is built

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Conflict-of-interest scoring** — Why defer: requires voting data + industry classification + transparent methodology. High controversy risk if done wrong.
- [ ] **Campaign finance Sankey visualization** — Why defer: depends on Eidg. Kanzlei data quality and availability (law is only since 2021, data is still sparse).
- [ ] **AI natural language queries** — Why defer: impressive demo but requires robust structured search underneath. LLM integration adds cost, latency, and hallucination risk.
- [ ] **Annotation and storytelling layer** — Why defer: needs journalist co-design and significant editor UI. Only valuable with active journalist users.
- [ ] **Lobbyregister integration** — Why defer: data only available since 2022, limited coverage.
- [ ] **Linked Open Data / SPARQL endpoint** — Why defer: valuable for ecosystem but zero user-facing value for v1.
- [ ] **Cantonal parliament expansion** — Why defer: 26 different data formats, massive engineering. Federal first.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Politician profile pages | HIGH | MEDIUM | P1 |
| Declared interests display | HIGH | MEDIUM | P1 |
| Interactive network graph | HIGH | HIGH | P1 |
| Global search | HIGH | MEDIUM | P1 |
| Shareable URLs | HIGH | LOW | P1 |
| Source attribution | HIGH | LOW | P1 |
| Filtering & faceted nav | HIGH | MEDIUM | P1 |
| Responsive design | HIGH | MEDIUM | P1 |
| Dark-mode design system | MEDIUM | MEDIUM | P1 |
| Organization profiles | HIGH | MEDIUM | P1 |
| Data freshness indicators | MEDIUM | LOW | P1 |
| Zefix integration | HIGH | HIGH | P2 |
| Party/industry heatmaps | HIGH | MEDIUM | P2 |
| Watchlist & email alerts | MEDIUM | MEDIUM | P2 |
| Public API | MEDIUM | MEDIUM | P2 |
| Data export (CSV/JSON) | MEDIUM | LOW | P2 |
| Voting record display | MEDIUM | MEDIUM | P2 |
| Conflict-of-interest scoring | HIGH | HIGH | P3 |
| Campaign finance Sankey | HIGH | HIGH | P3 |
| AI natural language queries | HIGH | HIGH | P3 |
| Annotation/storytelling | MEDIUM | HIGH | P3 |
| Linked Open Data | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | OpenSecrets (US) | LittleSis (US) | Lobbywatch.ch (CH) | TheyWorkForYou (UK) | Parltrack (EU) | Abgeordnetenwatch (DE) | Seilschaften.ch (planned) |
|---------|-----------------|-----------------|---------------------|---------------------|----------------|----------------------|--------------------------|
| Politician profiles | Yes, detailed | Yes, entity pages | Yes, with interests | Yes, with voting summary | Yes, MEP pages | Yes, with Q&A | Yes — core feature |
| Organization profiles | Yes, by industry | Yes, entity pages | Partial (orgs in DB) | No | No | No | Yes — reverse lookup |
| Network graph | No | Yes (Oligrapher) | Partial (basic viz) | No | No | No | Yes — core differentiator |
| Cross-register fusion | Partial (FEC+lobbying) | Yes (crowd-sourced) | No (parliament only) | No | No | No | Yes — core value prop |
| Search | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Voting records | No (separate site) | No | No | Yes — core feature | Yes — vote tracking | Yes | Planned (v1.x) |
| Email alerts | No | No | No | Yes — core feature | Yes (dossier alerts) | No | Planned (v1.x) |
| API | Discontinued (2025) | Yes | Yes (JSON) | Yes | Yes (JSON/CSV) | No | Planned (v1.x) |
| Data export | Yes (bulk download) | No | Yes (CSV/JSON/GraphML) | Yes (XML) | Yes (JSON/CSV) | No | Planned (v1.x) |
| Campaign finance viz | Yes — core feature | No | No | No | No | No | Planned (v2+) |
| Conflict-of-interest | Implicit (funding data) | No | Basic (interests list) | Basic (voting vs. interests) | No | No | Planned (v2+, scored) |
| Mobile-friendly | Yes | Partial | Yes | Yes | No | Yes | Yes — P1 |
| Dark mode | No | No | No | No | No | No | Yes — design identity |
| AI/NLP search | No | No | No | No | No | No | Planned (v2+) |
| Open source | No | Yes | Yes | Yes | Yes | Partial | Yes (MIT) |
| Crowd-sourced data | No | Yes — core model | No | No | No | Yes (Q&A) | No — anti-feature |
| Linked Open Data | No | No | Yes (via zazuko) | No | No | No | Planned (v2+) |
| Annotation/storytelling | No | Yes (Oligrapher) | No | No | No | No | Planned (v2+) |

## Key Insights

1. **The graph is the gap.** No Swiss platform and few global platforms offer interactive network graph exploration. LittleSis has Oligrapher but it is an editor tool, not an exploration tool. This is the primary differentiator.

2. **Cross-register fusion does not exist in Switzerland.** Lobbywatch covers parliament only. Zefix covers companies only. Nobody connects them. This is the core value proposition and no competitor addresses it.

3. **Alerts are underrated.** TheyWorkForYou's most-used feature by civil society is email alerts. Parltrack's notification system is heavily used by EU watchdogs. Build this in v1.x, not v2.

4. **Crowd-sourcing is a trap for a Swiss platform.** LittleSis can do it because it has a large US activist base. In Switzerland (8.7M population, 4 languages, small civic tech community), crowd-sourcing would produce thin, unverifiable data. Official register data is the strength.

5. **AI features are emerging but not table stakes.** The European Parliament experimented with NLP search. No transparency platform has made it core yet. It is a v2+ differentiator, not a launch requirement.

6. **Design is an untapped differentiator.** Every existing platform looks functional but dated. A polished, dark-mode, data-dense design would immediately signal credibility and differentiate visually.

## Sources

- [OpenSecrets](https://www.opensecrets.org/) — US campaign finance and lobbying platform, research tools and data categories
- [OpenSecrets Research Tools](https://www.opensecrets.org/research-tools) — Data manipulation and custom display features
- [LittleSis](https://littlesis.org/toolkit) — Power mapping toolkit and Oligrapher network visualization
- [Oligrapher (GitHub)](https://github.com/public-accountability/oligrapher) — Open source network graph editor, React-based
- [Lobbywatch.ch](https://lobbywatch.ch/de) — Swiss parliamentary lobbying database with 50,000+ datasets
- [Lobbywatch Data Export](https://lobbywatch.ch/de/seite/datenexport) — CSV, JSON, GraphML, MySQL export formats
- [Lobbywatch LOD Platform](https://lod.lobbywatch.ch/) — Linked Open Data via zazuko
- [Lobbywatch API (GitHub)](https://github.com/lobbywatch/api) — JSON data interface for Interessenbindungen
- [TheyWorkForYou](https://www.theyworkforyou.com/) — UK parliamentary monitoring with debate search, alerts, voting records
- [TheyWorkForYou Votes Update (Oct 2025)](https://www.mysociety.org/2025/10/22/voting-summaries-update-october-2025/) — Richer voting analysis features
- [TheyWorkForYou Alerts](https://www.theyworkforyou.com/alert/) — Email alert system for parliamentary monitoring
- [Parltrack](https://parltrack.org/) — EU Parliament tracking with dossier, MEP, vote, and amendment data
- [Parltrack 2.0 Blog](https://parltrack.org/blog/track-every-vote-in-the-ep-with-pt2.0.html) — Vote tracking features
- [Abgeordnetenwatch.de](https://www.abgeordnetenwatch.de/ueber-uns/mehr/international) — German parliamentary monitoring with Q&A feature
- [Smartvote](https://www.smartvote.ch/en) — Swiss voting advice application with smartspider visualization
- [OECD AI in Civic Participation (2025)](https://www.oecd.org/en/publications/2025/06/governing-with-artificial-intelligence_398fa287/full-report/ai-in-civic-participation-and-open-government_51227ce7.html) — AI trends in civic tech

---
*Feature research for: Swiss political transparency and lobbying disclosure platform (Seilschaften.ch)*
*Researched: 2026-02-27*
