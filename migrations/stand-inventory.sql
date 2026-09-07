-- Stand inventory: traccia le card premio rimanenti per ogni stand
-- Ogni stand parte con 20 card (tranne Maryaic/A0014 con 19)

CREATE TABLE IF NOT EXISTS stand_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id text NOT NULL UNIQUE,
  total int NOT NULL DEFAULT 20,
  remaining int NOT NULL DEFAULT 20,
  updated_at timestamptz DEFAULT now()
);

-- Seed: tutti gli artisti attivi con 20/20
INSERT INTO stand_inventory (artist_id, total, remaining)
SELECT display_id, 20, 20
FROM artists
WHERE active = true AND display_id != 'A0014'
ON CONFLICT (artist_id) DO NOTHING;

-- Maryaic (A0014) ha solo 19 card fisiche
INSERT INTO stand_inventory (artist_id, total, remaining)
VALUES ('A0014', 19, 19)
ON CONFLICT (artist_id) DO UPDATE SET total = 19, remaining = 19;

-- RPC: ritorna stand disponibili con remaining > 0, ordinati per nome
CREATE OR REPLACE FUNCTION get_available_stands()
RETURNS TABLE(
  artist_id text,
  name text,
  display_id text,
  total int,
  remaining int
) AS $$
  SELECT si.artist_id, a.name, a.display_id, si.total, si.remaining
  FROM stand_inventory si
  JOIN artists a ON a.display_id = si.artist_id
  WHERE si.remaining > 0 AND a.active = true
  ORDER BY a.name ASC;
$$ LANGUAGE sql;

-- RPC: sottrae card dagli stand selezionati (extra)
CREATE OR REPLACE FUNCTION redeem_stand_cards(
  p_artist_ids text[],
  p_counts int[]
) RETURNS void AS $$
DECLARE
  i int;
BEGIN
  FOR i IN 1..array_length(p_artist_ids, 1) LOOP
    UPDATE stand_inventory
    SET remaining = remaining - p_counts[i],
        updated_at = now()
    WHERE artist_id = p_artist_ids[i]
      AND remaining >= p_counts[i];
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Card non disponibili per stand %', p_artist_ids[i];
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RPC: estrae gatcha (le N con remaining più alto, ordine casuale a parimerito)
CREATE OR REPLACE FUNCTION draw_gatcha_prizes(
  p_count int
) RETURNS TABLE(artist_id text, name text, remaining int) AS $$
  SELECT si.artist_id, a.name, si.remaining
  FROM stand_inventory si
  JOIN artists a ON a.display_id = si.artist_id
  WHERE si.remaining > 0 AND a.active = true
  ORDER BY si.remaining DESC, RANDOM()
  LIMIT p_count;
$$ LANGUAGE sql;

-- Verifica
-- SELECT artist_id, total, remaining FROM stand_inventory ORDER BY artist_id;
-- SELECT * FROM get_available_stands();
-- SELECT * FROM draw_gatcha_prizes(4);
