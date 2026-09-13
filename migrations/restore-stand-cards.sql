-- =====================================================
-- RPC: ripristina card nello stand_inventory (undo)
-- Incrementa remaining per ogni artist_id dato
-- =====================================================

CREATE OR REPLACE FUNCTION restore_stand_cards(
  p_artist_ids text[]
) RETURNS void AS $$
DECLARE
  i int;
BEGIN
  FOR i IN 1..array_length(p_artist_ids, 1) LOOP
    UPDATE stand_inventory
    SET remaining = LEAST(remaining + 1, total),
        updated_at = now()
    WHERE artist_id = p_artist_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;
