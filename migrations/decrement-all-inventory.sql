-- RPC: riduci di 1 tutte le card rimanenti (usata per Full Collection)
CREATE OR REPLACE FUNCTION decrement_all_inventory()
RETURNS void
AS $$
BEGIN
  UPDATE stand_inventory SET remaining = remaining - 1 WHERE remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant per autenticati
GRANT EXECUTE ON FUNCTION decrement_all_inventory() TO authenticated;
