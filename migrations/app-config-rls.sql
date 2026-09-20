-- RLS per app_config: permetti lettura a tutti gli utenti autenticati
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app_config"
  ON app_config FOR SELECT
  USING (auth.role() = 'authenticated');
