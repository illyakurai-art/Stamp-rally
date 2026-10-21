-- Path immagine mappa edizione corrente (letta da /mappa live e /admin/map-editor).
-- Default: /mappa.webp.
-- Quando carichi la mappa della nuova edizione (es. /mappa-bologna-2027.webp in public/),
-- aggiorna il valore:
--   INSERT INTO app_config (key, value) VALUES ('edition_current_map', '/mappa-bologna-2027.webp')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- L'archivio edizioni passate usa invece edition_novegro_2026_map (mappa congelata).

INSERT INTO app_config (key, value) VALUES ('edition_current_map', '/mappa.webp')
ON CONFLICT (key) DO NOTHING;

-- Verifica
-- SELECT * FROM app_config WHERE key LIKE 'edition%map%';
