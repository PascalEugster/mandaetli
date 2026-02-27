-- Search function for fuzzy actor search via pg_trgm
-- Called via supabase.rpc('search_actors', { query, max_results })

CREATE OR REPLACE FUNCTION search_actors(
  query TEXT,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  actor_type actor_type,
  canton TEXT,
  council council_type,
  party_id UUID,
  abbreviation TEXT,
  color TEXT,
  portrait_url TEXT,
  industry TEXT,
  similarity REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.name,
    a.first_name,
    a.last_name,
    a.actor_type,
    a.canton,
    a.council,
    a.party_id,
    a.abbreviation,
    a.color,
    a.portrait_url,
    a.industry,
    similarity(a.name, query) AS similarity
  FROM actors a
  WHERE a.name % query OR a.name ILIKE '%' || query || '%'
  ORDER BY similarity(a.name, query) DESC
  LIMIT max_results;
END;
$$;
