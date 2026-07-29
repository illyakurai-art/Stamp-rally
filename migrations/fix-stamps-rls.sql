-- Fix: aggiorna le policy RLS della tabella stamps per supportare
-- sia lo schema originale (user_id = UUID) che lo schema migrato (user_id = display_id es. U0001)

-- Rimuovi le policy esistenti
DROP POLICY IF EXISTS "Users can view own stamps" ON public.stamps;
DROP POLICY IF EXISTS "Users can insert own stamps" ON public.stamps;
DROP POLICY IF EXISTS "Staff can view all stamps" ON public.stamps;

-- Policy SELECT: l'utente può vedere i propri timbri
-- sia con UUID che con display_id
CREATE POLICY "Users can view own stamps"
  ON public.stamps FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR user_id = (
      SELECT display_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy INSERT: l'utente può inserire timbri solo per se stesso
-- sia con UUID che con display_id
CREATE POLICY "Users can insert own stamps"
  ON public.stamps FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    OR user_id = (
      SELECT display_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy SELECT per staff: possono vedere tutti i timbri
CREATE POLICY "Staff can view all stamps"
  ON public.stamps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'staff'
    )
  );
