-- =====================================================
-- Pulizia automatica notifiche più vecchie di 10 minuti
-- Esegui su Supabase SQL Editor (idempotente)
-- =====================================================

-- 0. Abilita pg_cron (se non ancora attivo)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Funzione di pulizia
CREATE OR REPLACE FUNCTION public.purge_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < now() - interval '10 minutes';
END;
$$;

-- 2. Programma il job ogni minuto (pg_cron)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-old-notifications') THEN
    PERFORM cron.schedule(
      'purge-old-notifications',   -- nome job
      '* * * * *',                 -- ogni minuto
      'SELECT public.purge_old_notifications()'
    );
  END IF;
END;
$$;
