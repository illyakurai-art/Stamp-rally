-- Aggiunge campo 'redeemed' alla tabella stamps
-- I timbri non vengono più cancellati al redeem, ma marcati come riscattati
-- Esegui su Supabase SQL Editor

-- 1. Aggiungi colonna
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS redeemed boolean DEFAULT false;

-- 2. Indice per filtrare rapidamente i timbri attivi
CREATE INDEX IF NOT EXISTS idx_stamps_redeemed ON stamps (redeemed);

-- 3. Aggiorna RPC add_stamp: cooldown solo per timbri non riscattati
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
    VALUES (v_user_id, 'Utente', 'U' || lpad(nextval('user_id_seq')::text, 4, '0'))
    ON CONFLICT (id) DO UPDATE
    SET display_id = COALESCE(profiles.display_id, EXCLUDED.display_id)
    RETURNING display_id INTO v_user_display_id;
  END IF;

  SELECT display_id INTO v_artist_display_id
  FROM artists WHERE qr_token = p_artist_qr_token AND active = true;

  IF v_artist_display_id IS NULL THEN
    RAISE EXCEPTION 'QR token non valido o artista non attivo';
  END IF;

  -- Cooldown 20s: solo per timbri NON riscattati
  IF EXISTS (
    SELECT 1 FROM stamps
    WHERE user_id = v_user_display_id
      AND artist_id = v_artist_display_id
      AND redeemed = false
      AND stamped_at > now() - interval '20 seconds'
  ) THEN
    RAISE EXCEPTION 'Attendi prima di timbrare nuovamente questo stand';
  END IF;

  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- 4. Aggiorna RPC get_stamp_counts_by_users: conta solo timbri attivi
CREATE OR REPLACE FUNCTION get_stamp_counts_by_users(p_user_ids text[])
RETURNS TABLE (user_id text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT stamps.user_id, COUNT(*)::bigint
  FROM stamps
  WHERE stamps.user_id = ANY(p_user_ids)
    AND stamps.redeemed = false
  GROUP BY stamps.user_id;
$$;

-- 5. Aggiorna RPC get_stamp_counts_by_artists: conta solo timbri attivi
CREATE OR REPLACE FUNCTION get_stamp_counts_by_artists(p_artist_ids text[])
RETURNS TABLE (artist_id text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT s.artist_id, COUNT(*)::bigint
  FROM stamps s
  LEFT JOIN profiles p ON p.display_id = s.user_id
  WHERE s.artist_id = ANY(p_artist_ids)
    AND (p.role IS DISTINCT FROM 'staff')
    AND s.redeemed = false
  GROUP BY s.artist_id;
$$;

-- 6. Query storica: timbri totali per stand (stima approssimativa dai redeem)
-- Ogni full collection = 1 timbro per ogni stand (51 stands x 1)
-- Ogni tier < 50 = timbri proporzionalmente distribuiti
-- Nota: stima approssimativa perché i timbri rimossi non tracciano lo stand
CREATE OR REPLACE VIEW stamp_history_by_stand AS
SELECT
  a.display_id,
  a.name,
  -- Timbri attivi (non riscattati)
  COALESCE(active.count, 0) AS timbri_attivi,
  -- Timbri riscattati (stima: proporzionale ai tier riscattati / num_stands)
  COALESCE(redeemed.count, 0) AS timbri_riscattati_stima,
  -- Totale
  COALESCE(active.count, 0) + COALESCE(redeemed.count, 0) AS timbri_totali_stima
FROM artists a
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS count
  FROM stamps s
  WHERE s.artist_id = a.display_id AND s.redeemed = false
) active ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS count
  FROM stamps s
  WHERE s.artist_id = a.display_id AND s.redeemed = true
) redeemed ON true
WHERE a.active = true
ORDER BY timbri_totali_stima DESC;
