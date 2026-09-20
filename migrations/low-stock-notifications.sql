-- Notifica periodica ogni 5 minuti per card in esaurimento
-- Esegui su Supabase SQL Editor

-- 1. Abilita estensioni
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Funzione con SECURITY DEFINER che bypassa RLS
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold int := 3;
  v_count int;
  v_user RECORD;
BEGIN
  -- Conta stand con card <= soglia
  SELECT count(*)
  INTO v_count
  FROM stand_inventory si
  JOIN artists a ON a.display_id = si.artist_id
  WHERE si.remaining <= v_threshold AND si.remaining > 0 AND a.active = true;

  IF v_count = 0 THEN
    RETURN;
  END IF;

  -- Per ogni utente visitor, inserisci notifica se non ne ha ricevuta una negli ultimi 6 min
  FOR v_user IN
    SELECT p.id
    FROM profiles p
    WHERE p.role = 'visitor'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = p.id
          AND n.type = 'low_stock'
          AND n.created_at > now() - interval '6 minutes'
      )
  LOOP
    INSERT INTO notifications (user_id, type, payload)
    VALUES (
      v_user.id,
      'low_stock',
      jsonb_build_object(
        'message', 'ATTENZIONE: Alcune prize card sono in esaurimento, affrettatevi!'
      )
    );
  END LOOP;
END;
$$;

-- 3. Schedulazione: ogni 5 minuti
SELECT cron.schedule(
  'low-stock-notifications',
  '*/5 * * * *',
  $$SELECT notify_low_stock()$$
);

-- Verifica
-- SELECT * FROM cron.job WHERE jobname = 'low-stock-notifications';
-- SELECT notify_low_stock();
