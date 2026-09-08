-- RLS policy per stand_inventory: permetti lettura a utenti autenticati
ALTER TABLE stand_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read stand_inventory"
  ON stand_inventory
  FOR SELECT
  TO authenticated
  USING (true);

-- Verifica
SELECT * FROM stand_inventory WHERE remaining > 0;
