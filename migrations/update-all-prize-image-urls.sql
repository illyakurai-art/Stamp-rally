-- =====================================================
-- Aggiorna prize_image_url di TUTTI gli artisti
-- Bucket: "Premi artisti" / <display_id>.webp
-- Esegui su Supabase SQL Editor
-- =====================================================

UPDATE public.artists
SET prize_image_url = 'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Premi%20artisti/' || display_id || '.webp'
WHERE prize_image_url IS NULL
   OR prize_image_url != 'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Premi%20artisti/' || display_id || '.webp';

-- Verifica
SELECT display_id, name, prize_image_url
FROM public.artists
ORDER BY display_id;
