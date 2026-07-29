-- 8. RPC: aggiorna add_stamp
DROP FUNCTION IF EXISTS add_stamp(text);

CREATE OR REPLACE FUNCTION add_stamp(p_artist_qr_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_display_id text;
  v_artist_display_id text;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  -- Recupera display_id dell'utente
  SELECT display_id INTO v_user_display_id
  FROM profiles WHERE id = v_user_id;

  -- Se il profilo non ha un display_id, generalo/recuperalo automaticamente
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

  -- Inserisci il timbro (evitando duplicati)
  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;
