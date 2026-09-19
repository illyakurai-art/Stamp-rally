-- Traccia le card premio assegnate ad ogni redeem
-- Ogni redeem può avere card extra (scelte dall'utente) e gatcha (estratte casualmente)

CREATE TABLE IF NOT EXISTS redeem_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  redeem_id uuid NOT NULL REFERENCES redeems(id) ON DELETE CASCADE,
  artist_id text NOT NULL,
  source text NOT NULL CHECK (source IN ('extra', 'gatcha')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redeem_cards_redeem_id ON redeem_cards (redeem_id);
CREATE INDEX IF NOT EXISTS idx_redeem_cards_artist_id ON redeem_cards (artist_id);

-- RLS
ALTER TABLE redeem_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all redeem_cards"
  ON redeem_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'staff'
    )
  );

CREATE POLICY "Staff can insert redeem_cards"
  ON redeem_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'staff'
    )
  );
