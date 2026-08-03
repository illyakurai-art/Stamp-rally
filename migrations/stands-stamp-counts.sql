-- Migration: conteggio timbri aggregato per stand (artista) — sezione Admin "Stand"
-- Esegui questo SQL nel Supabase SQL Editor (idempotente)
-- Esclude i timbri elargiti agli utenti staff (coerenza con la pagina Utenti)

DROP FUNCTION IF EXISTS get_stamp_counts_by_artists(text[]);
CREATE OR REPLACE FUNCTION get_stamp_counts_by_artists(p_artist_ids text[])
RETURNS TABLE (artist_id text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT s.artist_id, COUNT(*)::bigint
  FROM stamps s
  LEFT JOIN profiles p ON p.display_id = s.user_id
  WHERE s.artist_id = ANY(p_artist_ids)
    AND (p.role IS DISTINCT FROM 'staff')
  GROUP BY s.artist_id;
END;
$$;
