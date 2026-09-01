-- =====================================================
-- Aggiunge 2 nuovi artisti (A0050–A0051)
-- Esegui su Supabase SQL Editor (idempotente)
-- =====================================================

INSERT INTO artists (name, display_id, qr_token, active, image_url)
VALUES
  ('Shanaru',  'A0050', 'Shanaru_stamp',  true,
   'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Artist%20PFP/A0050.webp'),
  ('Gh0stje',  'A0051', 'Gh0stje_stamp',  true,
   'https://qoniejhhzixwzgtzlngo.supabase.co/storage/v1/object/public/artists-cards/Artist%20PFP/A0051.webp')
ON CONFLICT (display_id) DO NOTHING;

-- Aggiorna instagram (usa il nome come handle base)
UPDATE public.artists SET instagram = 'shanaruu'  WHERE display_id = 'A0050';
UPDATE public.artists SET instagram = 'Gh0stje'  WHERE display_id = 'A0051';

-- Verifica
SELECT display_id, name, qr_token, instagram, image_url
FROM public.artists
WHERE display_id IN ('A0050', 'A0051');

-- Corregge nome artista A0033
UPDATE public.artists SET name = 'Vyeranika' WHERE display_id = 'A0033';

-- Corregge nome e instagram artista A0023
UPDATE public.artists SET name = 'M4uv3s', instagram = 'm4uv3s' WHERE display_id = 'A0023';

-- Corregge nome artista A0042
UPDATE public.artists SET name = 'Aya''s illustrations' WHERE display_id = 'A0042';

-- Formattazione nomi: prima lettera maiuscola, resto minuscolo
-- (eccezione: ARTeapot Studio resta come scritto)
UPDATE public.artists SET name = 'Cristychan96'    WHERE display_id = 'A0002';
UPDATE public.artists SET name = 'Aeritus'         WHERE display_id = 'A0003';
UPDATE public.artists SET name = 'Chiara mazzetti' WHERE display_id = 'A0007';
UPDATE public.artists SET name = 'Chizuruleech'    WHERE display_id = 'A0008';
UPDATE public.artists SET name = 'Mewslab'         WHERE display_id = 'A0010';
UPDATE public.artists SET name = 'Faleneee'        WHERE display_id = 'A0011';
UPDATE public.artists SET name = 'Irartchan'       WHERE display_id = 'A0012';
UPDATE public.artists SET name = 'Mamapou'         WHERE display_id = 'A0013';
UPDATE public.artists SET name = 'Maryaic'         WHERE display_id = 'A0014';
UPDATE public.artists SET name = 'Mogekodraws'     WHERE display_id = 'A0015';
UPDATE public.artists SET name = 'Noyaxart'        WHERE display_id = 'A0016';
UPDATE public.artists SET name = 'Phasenite'       WHERE display_id = 'A0017';
UPDATE public.artists SET name = 'Pollina'         WHERE display_id = 'A0018';
UPDATE public.artists SET name = 'Irizaurahel'     WHERE display_id = 'A0019';
UPDATE public.artists SET name = 'Sophyret'        WHERE display_id = 'A0020';
UPDATE public.artists SET name = 'Tortellinoart'   WHERE display_id = 'A0021';
UPDATE public.artists SET name = 'Vraptor.pe'      WHERE display_id = 'A0022';
UPDATE public.artists SET name = 'Gaerss'          WHERE display_id = 'A0024';
UPDATE public.artists SET name = 'Onigiri'         WHERE display_id = 'A0031';
UPDATE public.artists SET name = 'Skredjun'        WHERE display_id = 'A0032';
UPDATE public.artists SET name = 'Xhikarx'         WHERE display_id = 'A0034';
UPDATE public.artists SET name = 'Shynmeiart'      WHERE display_id = 'A0036';
UPDATE public.artists SET name = 'Angimcandjuju'   WHERE display_id = 'A0038';
UPDATE public.artists SET name = 'Bungodhearth'    WHERE display_id = 'A0040';
UPDATE public.artists SET name = 'Wingmadewithlove' WHERE display_id = 'A0041';
UPDATE public.artists SET name = 'Fededeko'        WHERE display_id = 'A0043';
UPDATE public.artists SET name = 'Rizapon'         WHERE display_id = 'A0044';
UPDATE public.artists SET name = 'Akane_drawing_'  WHERE display_id = 'A0045';
UPDATE public.artists SET name = 'ARTeapot Studio' WHERE display_id = 'A0046';
UPDATE public.artists SET name = 'Kumishire'       WHERE display_id = 'A0047';
UPDATE public.artists SET name = 'Narkao'          WHERE display_id = 'A0048';
