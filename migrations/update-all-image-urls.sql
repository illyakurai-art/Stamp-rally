-- =====================================================
-- Aggiorna image_url di TUTTI gli artisti in base al display_id
-- Le webp sono nel bucket: Artist PFP/<display_id>.webp
-- Esegui su Supabase SQL Editor
-- =====================================================

UPDATE public.artists
SET image_url = 'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Artist%20PFP/' || display_id || '.webp'
WHERE image_url IS NULL
   OR image_url != 'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Artist%20PFP/' || display_id || '.webp';

-- Verifica
SELECT display_id, name, image_url
FROM public.artists
ORDER BY display_id;
