-- Blocco timbri: tabella config + funzione add_stamp aggiornata
-- Esegui su Supabase SQL Editor

-- 1. Tabella configurazione
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO app_config (key, value)
VALUES ('rally_terminated', 'false')
ON CONFLICT (key) DO NOTHING;

-- 2. Funzione add_stamp con blocco rally
CREATE OR REPLACE FUNCTION add_stamp(p_artist_qr_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_display_id text;
  v_artist_display_id text;
  v_user_id uuid := auth.uid();
  v_terminated text;
BEGIN
  -- BLOCCO RALLY TERMINATA
  SELECT value INTO v_terminated FROM app_config WHERE key = 'rally_terminated';
  IF v_terminated = 'true' THEN
    RAISE EXCEPTION 'La Stamp Rally è al momento terminata';
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  SELECT display_id INTO v_user_display_id
  FROM profiles WHERE id = v_user_id;

  IF v_user_display_id IS NULL THEN
    INSERT INTO profiles (id, nickname, display_id)
    VALUES (
      v_user_id,
      'Utente',
      'U' || lpad(nextval('user_id_seq')::text, 4, '0')
    )
    ON CONFLICT (id) DO UPDATE
    SET display_id = COALESCE(profiles.display_id, EXCLUDED.display_id)
    RETURNING display_id INTO v_user_display_id;
  END IF;

  SELECT display_id INTO v_artist_display_id
  FROM artists WHERE qr_token = p_artist_qr_token AND active = true;

  IF v_artist_display_id IS NULL THEN
    RAISE EXCEPTION 'QR token non valido o artista non attivo';
  END IF;

  IF EXISTS (
    SELECT 1 FROM stamps
    WHERE user_id = v_user_display_id
      AND artist_id = v_artist_display_id
      AND stamped_at > now() - interval '20 seconds'
  ) THEN
    RAISE EXCEPTION 'Attendi prima di timbrare nuovamente questo stand';
  END IF;

  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- 3. Attiva il blocco
UPDATE app_config SET value = 'true' WHERE key = 'rally_terminated';

-- Verifica
SELECT * FROM app_config;
