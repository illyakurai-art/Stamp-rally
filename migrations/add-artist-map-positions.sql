-- Posizioni stand per edizione: snapshot coordinate mappa + nomi artisti + path immagine mappa archivio
-- Applicare su Supabase (SQL editor). Idempotente: può essere rieseguita —
-- se la tabella esiste già senza la colonna name viene aggiunta e riempita.
-- Il codice admin (tab StampApp) usa la tabella se presente, altrimenti
-- fa fallback su artists.map_x/map_y → sicuro da deployare prima o dopo.

CREATE TABLE IF NOT EXISTS artist_map_positions (
  edition_key text NOT NULL,
  artist_id   text NOT NULL,
  name        text NOT NULL DEFAULT '',
  map_x int NOT NULL,
  map_y int NOT NULL,
  PRIMARY KEY (edition_key, artist_id)
);

-- Se la tabella è stata creata con la versione precedente (senza name): aggiungi la colonna
ALTER TABLE artist_map_positions ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

-- RLS: lettura per utenti autenticati (usato dall'archivio admin)
ALTER TABLE artist_map_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read map positions" ON artist_map_positions;
CREATE POLICY "Authenticated users can read map positions"
  ON artist_map_positions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Snapshot: le attuali artists.map_x/map_y sono le posizioni Novegro 2026.
-- Le colonne artists restano "posizioni edizione corrente" per la mappa live.
INSERT INTO artist_map_positions (edition_key, artist_id, name, map_x, map_y)
SELECT 'edition_novegro_2026', display_id, name, map_x::int, map_y::int
FROM artists
WHERE display_id IS NOT NULL AND map_x IS NOT NULL AND map_y IS NOT NULL
ON CONFLICT (edition_key, artist_id) DO NOTHING;

-- Backfill nomi per righe inserite con la versione precedente della tabella
UPDATE artist_map_positions p
SET name = a.name
FROM artists a
WHERE p.artist_id = a.display_id
  AND p.name = '';

-- Path immagine mappa Novegro per l'archivio (asset congelato mappa-novegro-2026.webp):
-- l'archivio resta valido anche quando la mappa live passerà alla nuova location
INSERT INTO app_config (key, value)
SELECT 'edition_novegro_2026_map', '/mappa-novegro-2026.webp'
WHERE NOT EXISTS (SELECT 1 FROM app_config WHERE key = 'edition_novegro_2026_map');

-- Verifica
-- SELECT artist_id, name, map_x, map_y FROM artist_map_positions WHERE edition_key = 'edition_novegro_2026' ORDER BY artist_id;
-- SELECT * FROM app_config WHERE key = 'edition_novegro_2026_map';
