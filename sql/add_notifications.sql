-- =====================================================
-- Tabella notifiche per utenti (popup premio riscattato)
-- Esegui su Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'redeem',
  payload jsonb NOT NULL DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Replica identity FULL necessaria per i filtri in postgres_changes
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Utente vede solo le proprie notifiche
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Staff può inserire notifiche per qualsiasi utente
DROP POLICY IF EXISTS "Staff can insert notifications" ON public.notifications;
CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_my_role() = 'staff');

-- Utente può marcare come letta la propria notifica
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Abilita realtime sulla tabella
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
