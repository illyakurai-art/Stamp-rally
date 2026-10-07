-- Aggiunge i range date delle edizioni e i nomi in app_config
INSERT INTO app_config (key, value) VALUES
  ('edition_novegro_2026_name',  'Novegro Artist Alley 2026'),
  ('edition_novegro_2026_start', '2026-07-01'),
  ('edition_novegro_2026_end',   '2026-09-21'),
  ('edition_current_name',       'Bologna Nerd 2027'),
  ('edition_current_start',      '2026-10-01'),
  ('edition_current_end',        '2027-01-31')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
