-- RPC per eliminare l'account utente corrente
-- Esegui nel Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_display_id text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non autenticato';
  END IF;

  SELECT display_id INTO v_display_id FROM profiles WHERE id = v_user_id;

  DELETE FROM redeems WHERE user_id::text IN (v_user_id::text, v_display_id);
  DELETE FROM stamps WHERE user_id::text IN (v_user_id::text, v_display_id);
  DELETE FROM profiles WHERE id = v_user_id;
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
