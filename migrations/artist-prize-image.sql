-- =====================================================
-- Aggiunge la colonna prize_image_url alla tabella artists
-- per mostrare il premio messo in palio dall'artista
-- Esegui su Supabase SQL Editor (idempotente)
-- =====================================================

ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS prize_image_url text;

-- Verifica
SELECT id, name, display_id, image_url, prize_image_url
FROM public.artists
ORDER BY display_id;
