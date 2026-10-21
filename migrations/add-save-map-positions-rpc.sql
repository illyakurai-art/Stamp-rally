-- RPC: salva le posizioni pin sulla mappa live (artists.map_x/map_y)
-- Chiamata dall'editor admin /admin/map-editor (drag & drop).
-- Coordinate in percentuale (0-100) rispetto all'immagine mappa (1600px di larghezza).
-- map_x/map_y NULL = posizione rimossa.
-- ATTENZIONE: applicare migrations/add-artist-map-positions.sql PRIMA di usare
-- questa RPC con le posizioni della nuova edizione (snapshot Novegro).

CREATE OR REPLACE FUNCTION save_map_positions(
  p_artist_ids text[],
  p_map_x int[],
  p_map_y int[]
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

-- Verifica (da utente admin/staff autenticato):
-- SELECT save_map_positions(ARRAY['A0001'], ARRAY[50], ARRAY[50]);
-- SELECT display_id, map_x, map_y FROM artists ORDER BY display_id;
