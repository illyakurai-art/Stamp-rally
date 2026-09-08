-- Aggiunge la colonna name alla tabella stand_inventory

ALTER TABLE stand_inventory
  ADD COLUMN IF NOT EXISTS name text;

-- Popola name dagli artisti
UPDATE stand_inventory si
SET name = a.name
FROM artists a
WHERE a.display_id = si.artist_id
  AND si.name IS NULL;

-- Verifica
-- SELECT artist_id, name, total, remaining FROM stand_inventory ORDER BY artist_id;
