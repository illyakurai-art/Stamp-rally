-- =====================================================
-- Performance optimizations: indexes, constraints, RPC
-- Esegui su Supabase SQL Editor
-- =====================================================

-- 1. Indexes per le query critiche
CREATE INDEX IF NOT EXISTS idx_stamps_user_id ON public.stamps (user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_artist_id ON public.stamps (artist_id);
CREATE INDEX IF NOT EXISTS idx_stamps_created_at ON public.stamps (stamped_at DESC);
CREATE INDEX IF NOT EXISTS idx_stamps_user_artist ON public.stamps (user_id, artist_id);
CREATE INDEX IF NOT EXISTS idx_artists_qr_token ON public.artists (qr_token);
CREATE INDEX IF NOT EXISTS idx_artists_active ON public.artists (active);
CREATE INDEX IF NOT EXISTS idx_profiles_display_id ON public.profiles (display_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- 2. Rimuovi duplicati prima di creare il vincolo UNIQUE (opzionale, solo cleanup)
DELETE FROM public.stamps
WHERE ctid NOT IN (
  SELECT min(ctid) FROM public.stamps GROUP BY user_id, artist_id
);

-- 3. Compound unique constraint NON va bene per la rally (serve poter ritimbrare
--    lo stesso artista dopo un nuovo giro). Lo droppiamo se esiste.
ALTER TABLE public.stamps DROP CONSTRAINT IF EXISTS stamps_user_artist_unique;

-- 4. RPC ottimizzato: add_stamp con EXISTS(), query piu` leggere, transazione breve
DROP FUNCTION IF EXISTS add_stamp(text);
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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  -- Legge display_id (usa l'index su profiles.display_id)
  SELECT display_id INTO v_user_display_id
  FROM profiles WHERE id = v_user_id;

  -- Se manca, genera al volo (caso raro, primo accesso)
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

  -- Cerca artista per qr_token (usa idx_artists_qr_token)
  SELECT display_id INTO v_artist_display_id
  FROM artists WHERE qr_token = p_artist_qr_token AND active = true;

  IF v_artist_display_id IS NULL THEN
    RAISE EXCEPTION 'QR token non valido o artista non attivo';
  END IF;

  -- Controllo cooldown 20s: EXISTS e` piu` leggero di SELECT ... LIMIT 1
  IF EXISTS (
    SELECT 1 FROM stamps
    WHERE user_id = v_user_display_id
      AND artist_id = v_artist_display_id
      AND stamped_at > now() - interval '20 seconds'
  ) THEN
    RAISE EXCEPTION 'Attendi prima di timbrare nuovamente questo stand';
  END IF;

  -- Insert idempotente: ON CONFLICT DO NOTHING evita errori ma permette
  -- di ritimbrare lo stesso artista dopo un nuovo giro (i timbri vecchi
  -- vengono cancellati al redeem)
  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- 5. RPC: conteggio timbri aggregato per utente (admin dashboard)
--    Evita di trasferire 40K righe al client
DROP FUNCTION IF EXISTS get_stamp_counts_by_users(text[]);
CREATE OR REPLACE FUNCTION get_stamp_counts_by_users(p_user_ids text[])
RETURNS TABLE (user_id text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT stamps.user_id, COUNT(*)::bigint
  FROM stamps
  WHERE stamps.user_id = ANY(p_user_ids)
  GROUP BY stamps.user_id;
END;
$$;
