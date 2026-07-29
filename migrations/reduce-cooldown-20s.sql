-- Riduce il cooldown tra timbri da 30 a 20 secondi
-- Esegui su Supabase SQL Editor

CREATE OR REPLACE FUNCTION add_stamp(p_artist_qr_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_display_id text;
  v_artist_display_id text;
  v_user_id uuid := auth.uid();
  v_existing_id text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  -- Recupera display_id dell'utente
  SELECT display_id INTO v_user_display_id
  FROM profiles WHERE id = v_user_id;

  -- Se il profilo non ha un display_id, genera automaticamente
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

  -- Recupera display_id dell'artista tramite qr_token
  SELECT display_id INTO v_artist_display_id
  FROM artists WHERE qr_token = p_artist_qr_token AND active = true;

  IF v_artist_display_id IS NULL THEN
    RAISE EXCEPTION 'QR token non valido o artista non attivo';
  END IF;

  -- Cooldown: controlla se è già stato timbrato negli ultimi 20 secondi
  SELECT artist_id INTO v_existing_id
  FROM stamps
  WHERE user_id = v_user_display_id
    AND artist_id = v_artist_display_id
    AND created_at > now() - interval '20 seconds'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Attendi prima di timbrare nuovamente questo stand';
  END IF;

  -- Inserisci il timbro (evitando duplicati)
  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;
