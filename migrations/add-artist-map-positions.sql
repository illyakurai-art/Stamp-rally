-- Posizioni stand per edizione: snapshot coordinate mappa + path immagine mappa archivio
-- Applicare su Supabase (SQL editor).
-- Il codice admin (tab StampApp) usa la tabella se presente, altrimenti
-- fa fallback su artists.map_x/map_y → sicuro da deployare prima o dopo.

CREATE TABLE IF NOT EXISTS artist_map_positions (
  edition_key text NOT NULL,
  artist_id   text NOT NULL,
  map_x int NOT NULL,
  map_y int NOT NULL,
  PRIMARY KEY (edition_key, artist_id)
);

-- RLS: lettura per utenti autenticati (usato dall'archivio admin)
ALTER TABLE artist_map_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read map positions"
  ON artist_map_positions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Snapshot: le attuali artists.map_x/map_y sono le posizioni Novegro 2026.
-- Le colonne artists restano "posizioni edizione corrente" per la mappa live.
INSERT INTO artist_map_positions (edition_key, artist_id, map_x, map_y)
SELECT 'edition_novegro_2026', display_id, map_x::int, map_y::int
FROM artists
WHERE display_id IS NOT NULL AND map_x IS NOT NULL AND map_y IS NOT NULL
ON CONFLICT (edition_key, artist_id) DO NOTHING;

-- Path immagine mappa Novegro per l'archivio (asset congelato mappa-novegro-2026.webp):
-- l'archivio resta valido anche quando la mappa live passerà alla nuova location
INSERT INTO app_config (key, value)
SELECT 'edition_novegro_2026_map', '/mappa-novegro-2026.webp'
WHERE NOT EXISTS (SELECT 1 FROM app_config WHERE key = 'edition_novegro_2026_map');

-- Verifica
-- SELECT count(*) FROM artist_map_positions WHERE edition_key = 'edition_novegro_2026';
-- SELECT * FROM app_config WHERE key = 'edition_novegro_2026_map';
