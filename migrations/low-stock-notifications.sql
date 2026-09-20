-- Notifica periodica every 5 minuti per card in esaurimento
-- Esegui su Supabase SQL Editor

-- 1. Abilita pg_cron (se non già attivo)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Funzione che controlla inventario e invia notifiche
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_threshold int := 3;
  v_count int;
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

  -- Inserisci notifica per TUTTI gli utenti attivi (solo se non ne è stata mandata una identica negli ultimi 5 min)
  INSERT INTO notifications (user_id, type, payload)
  SELECT p.id, 'low_stock', jsonb_build_object(
    'message', 'ATTENZIONE: Alcune prize card sono in esaurimento, affrettatevi!'
  )
  FROM profiles p
  WHERE p.role = 'visitor'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = p.id
        AND n.type = 'low_stock'
        AND n.created_at > now() - interval '6 minutes'
    );
END;
$$;

-- 3. Schedulazione: ogni 5 minuti
SELECT cron.schedule(
  'low-stock-notifications',
  '*/5 * * * *',
  $$SELECT notify_low_stock()$$
);

-- Verifica job attivo
-- SELECT * FROM cron.job WHERE jobname = 'low-stock-notifications';
