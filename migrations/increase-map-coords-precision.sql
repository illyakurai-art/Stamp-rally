-- Precisione coordinate mappa: da interi a numeric (centesimi di percentuale, es. 12.34%)
-- Da applicare su Supabase PRIMA di salvare posizioni con il nuovo editor a 2 decimali.

-- Colonne artists: posizioni edizione corrente (mappa live + editor admin)
ALTER TABLE artists ALTER COLUMN map_x TYPE numeric USING map_x::numeric;
ALTER TABLE artists ALTER COLUMN map_y TYPE numeric USING map_y::numeric;

-- Colonne snapshot archivio: le righe esistenti restano interi, le prossime accettano decimali
ALTER TABLE artist_map_positions ALTER COLUMN map_x TYPE numeric USING map_x::numeric;
ALTER TABLE artist_map_positions ALTER COLUMN map_y TYPE numeric USING map_y::numeric;

-- Rimuovi la versione vecchia della RPC (parametri int[]) e ricrea con numeric[]
DROP FUNCTION IF EXISTS save_map_positions(text[], int[], int[]);

CREATE OR REPLACE FUNCTION save_map_positions(
  p_artist_ids text[],
  p_map_x numeric[],
  p_map_y numeric[]
) RETURNS void AS $$
DECLARE
  caller_role text;
  i int;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'staff') THEN
    RAISE EXCEPTION 'Permesso negato';
  END IF;

  IF coalesce(array_length(p_artist_ids, 1), 0) <> coalesce(array_length(p_map_x, 1), 0)
     OR coalesce(array_length(p_artist_ids, 1), 0) <> coalesce(array_length(p_map_y, 1), 0) THEN
    RAISE EXCEPTION 'Array di dimensioni diverse';
  END IF;

  FOR i IN 1..array_length(p_artist_ids, 1) LOOP
    UPDATE artists
    SET map_x = p_map_x[i], map_y = p_map_y[i]
    WHERE display_id = p_artist_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('artists', 'artist_map_positions') AND column_name IN ('map_x', 'map_y');
