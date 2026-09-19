-- Permetti lettura pubblica della tabella artists (necessario per la mappa)
-- La mappa deve essere accessibile anche senza login

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti
DROP POLICY IF EXISTS "Public read artists" ON public.artists;

-- Policy: tutti possono leggere gli artisti (mappa accessibile a ospiti)
CREATE POLICY "Public read artists"
  ON public.artists FOR SELECT
  USING (true);
