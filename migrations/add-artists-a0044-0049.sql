-- Aggiunge gli ultimi 6 artisti (A0044–A0049)
INSERT INTO artists (name, display_id, qr_token, active, map_x, map_y)
VALUES
  ('rizapon',        'A0044', 'rizapon_stamp',        true, NULL, NULL),
  ('akane_drawing_', 'A0045', 'akane_drawing__stamp', true, NULL, NULL),
  ('ARTeapotstudio', 'A0046', 'ARTeapotstudio_stamp', true, NULL, NULL),
  ('kumishire',      'A0047', 'kumishire_stamp',      true, NULL, NULL),
  ('narkao',         'A0048', 'narkao_stamp',         true, NULL, NULL),
  ('Reikacchan',     'A0049', 'Reikacchan_stamp',     true, NULL, NULL)
ON CONFLICT (display_id) DO NOTHING;