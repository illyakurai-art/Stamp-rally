-- =====================================================
-- Permetti allo staff di eliminare timbri (per il redeem)
-- Esegui su Supabase SQL Editor
-- =====================================================

DROP POLICY IF EXISTS "Staff can delete stamps" ON public.stamps;

CREATE POLICY "Staff can delete stamps"
  ON public.stamps FOR DELETE
  USING (public.get_my_role() = 'staff');
