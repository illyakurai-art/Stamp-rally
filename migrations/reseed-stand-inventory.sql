-- Riesegui la seed per inserire tutti gli artisti attivi
INSERT INTO stand_inventory (artist_id, total, remaining)
SELECT display_id, 20, 20
FROM artists
WHERE active = true AND display_id != 'A0014'
ON CONFLICT (artist_id) DO NOTHING;

-- Maryaic (A0014) ha solo 19 card fisiche
INSERT INTO stand_inventory (artist_id, total, remaining)
VALUES ('A0014', 19, 19)
ON CONFLICT (artist_id) DO UPDATE SET total = 19, remaining = 19;

-- Verifica quanti artisti ci sono ora
SELECT COUNT(*) as totale_artisti FROM stand_inventory;
SELECT artist_id, total, remaining, name FROM stand_inventory ORDER BY artist_id;
