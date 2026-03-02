-- Mandaetli.ch initial schema
-- ENUMs, tables, and indexes for Swiss political transparency data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENUMs
-- ============================================================

CREATE TYPE actor_type AS ENUM ('person', 'organization', 'party');
CREATE TYPE council_type AS ENUM ('NR', 'SR');
CREATE TYPE connection_type AS ENUM ('mandate', 'membership', 'lobbying', 'donation', 'employment');
CREATE TYPE confidence_level AS ENUM ('verified', 'declared', 'media_reported', 'inferred');
CREATE TYPE vote_decision AS ENUM ('yes', 'no', 'abstain', 'absent', 'not_participating');

-- ============================================================
-- DATA SOURCES
-- ============================================================

CREATE TABLE data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  base_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  last_synced_at TIMESTAMPTZ,
  record_count INTEGER NOT NULL DEFAULT 0,
  sync_frequency_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACTORS (hybrid normalized)
-- ============================================================

CREATE TABLE actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  actor_type actor_type NOT NULL,

  -- Shared fields
  name TEXT NOT NULL,
  name_fr TEXT,
  name_it TEXT,
  website TEXT,

  -- Person-specific (null for non-persons)
  first_name TEXT,
  last_name TEXT,
  party_id UUID REFERENCES actors(id),
  canton TEXT,
  council council_type,
  portrait_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  language TEXT,

  -- Organization-specific (null for non-orgs)
  industry TEXT,
  legal_form TEXT,
  uid TEXT,
  headquarters TEXT,

  -- Party-specific (null for non-parties)
  abbreviation TEXT,
  color TEXT,
  seats_nr INTEGER,
  seats_sr INTEGER,
  ideology_position NUMERIC(3,1),
  founded INTEGER,

  -- Overflow for rare/flexible fields
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONNECTIONS
-- ============================================================

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  target_actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  connection_type connection_type NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  role_fr TEXT,
  role_it TEXT,
  is_paid BOOLEAN,
  confidence confidence_level NOT NULL DEFAULT 'declared',

  -- Source attribution
  data_source_id TEXT REFERENCES data_sources(id),
  source_url TEXT,
  source_retrieved_at TIMESTAMPTZ,

  -- Validity period
  valid_from DATE,
  valid_until DATE,

  -- Overflow
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent exact duplicates
  UNIQUE(source_actor_id, target_actor_id, connection_type, data_source_id, role)
);

-- ============================================================
-- VOTES
-- ============================================================

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affair_id TEXT,
  affair_title TEXT NOT NULL,
  affair_title_fr TEXT,
  affair_title_it TEXT,
  vote_date DATE NOT NULL,
  council council_type NOT NULL,
  topic_category TEXT,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VOTE RECORDS
-- ============================================================

CREATE TABLE vote_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  decision vote_decision NOT NULL,

  UNIQUE(vote_id, actor_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Actors
CREATE INDEX idx_actors_type ON actors(actor_type);
CREATE INDEX idx_actors_slug ON actors(slug);
CREATE INDEX idx_actors_canton ON actors(canton) WHERE canton IS NOT NULL;
CREATE INDEX idx_actors_council ON actors(council) WHERE council IS NOT NULL;
CREATE INDEX idx_actors_party_id ON actors(party_id) WHERE party_id IS NOT NULL;
CREATE INDEX idx_actors_name_trgm ON actors USING GIN (name gin_trgm_ops);

-- Connections
CREATE INDEX idx_connections_source ON connections(source_actor_id);
CREATE INDEX idx_connections_target ON connections(target_actor_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_confidence ON connections(confidence);
CREATE INDEX idx_connections_active ON connections(source_actor_id, target_actor_id)
  WHERE valid_until IS NULL;

-- Votes
CREATE INDEX idx_votes_date ON votes(vote_date);

-- Vote records
CREATE INDEX idx_vote_records_actor ON vote_records(actor_id);
CREATE INDEX idx_vote_records_vote ON vote_records(vote_id);

-- ============================================================
-- RLS (permissive read for anon, will be tightened later)
-- ============================================================

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Public read access" ON actors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON connections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON vote_records FOR SELECT USING (true);
