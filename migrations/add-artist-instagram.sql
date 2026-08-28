-- =====================================================
-- Aggiunge la colonna instagram alla tabella artists
-- e imposta gli handle corretti
-- Esegui su Supabase SQL Editor (idempotente)
-- =====================================================

-- 1. Aggiunge la colonna
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS instagram text;

-- 2. Imposta gli handle Instagram usando i nomi degli artisti
UPDATE public.artists SET instagram = name;

-- 3. Corregge gli handle dove il nome IG è diverso dal nome artista
UPDATE public.artists SET instagram = 'aeritus_sara'       WHERE display_id = 'A0003';
UPDATE public.artists SET instagram = 'yumii_art_'        WHERE display_id = 'A0004';
UPDATE public.artists SET instagram = 'antheal_arts'      WHERE display_id = 'A0005';
UPDATE public.artists SET instagram = 'cherbox__'         WHERE display_id = 'A0006';
UPDATE public.artists SET instagram = 'chiaramazzetti.art' WHERE display_id = 'A0007';
UPDATE public.artists SET instagram = 'chizuruleechart'   WHERE display_id = 'A0008';
UPDATE public.artists SET instagram = 'mews.lab'          WHERE display_id = 'A0010';
UPDATE public.artists SET instagram = 'irart_chan'        WHERE display_id = 'A0012';
UPDATE public.artists SET instagram = 'mamaopou'          WHERE display_id = 'A0013';
UPDATE public.artists SET instagram = 'mary.aic'          WHERE display_id = 'A0014';
UPDATE public.artists SET instagram = 'moge_ko_draws'     WHERE display_id = 'A0015';
UPDATE public.artists SET instagram = 'phasenite_art'     WHERE display_id = 'A0017';
UPDATE public.artists SET instagram = '_pollinart'        WHERE display_id = 'A0018';
UPDATE public.artists SET instagram = 'ririzaurahel'      WHERE display_id = 'A0019';
UPDATE public.artists SET instagram = 'sophy.ret'         WHERE display_id = 'A0020';
UPDATE public.artists SET instagram = 'tortellino_art'    WHERE display_id = 'A0021';
UPDATE public.artists SET instagram = 'vraptor.pe_art'    WHERE display_id = 'A0022';
UPDATE public.artists SET instagram = 'gaerss_art'        WHERE display_id = 'A0024';
UPDATE public.artists SET instagram = 'dominiknene_art'   WHERE display_id = 'A0026';
UPDATE public.artists SET instagram = 'kaimy_y.a.k.i,kiyokaimy' WHERE display_id = 'A0027';
UPDATE public.artists SET instagram = 'kiyo__y.u.i,kiyokaimy'   WHERE display_id = 'A0028';
UPDATE public.artists SET instagram = 'lilliofthesea'     WHERE display_id = 'A0029';
UPDATE public.artists SET instagram = 'ninfadora7'        WHERE display_id = 'A0030';
UPDATE public.artists SET instagram = 'onigiri_illustrator' WHERE display_id = 'A0031';
UPDATE public.artists SET instagram = 'vyeranika.art'     WHERE display_id = 'A0033';
UPDATE public.artists SET instagram = 'xhikarx.draw'      WHERE display_id = 'A0034';
UPDATE public.artists SET instagram = 'angimcart'         WHERE display_id = 'A0038';
UPDATE public.artists SET instagram = 'zibysart'          WHERE display_id = 'A0039';
UPDATE public.artists SET instagram = 'bungod_hearth'     WHERE display_id = 'A0040';
UPDATE public.artists SET instagram = '_ayaisfyn_'        WHERE display_id = 'A0042';
UPDATE public.artists SET instagram = 'lordghirahim'      WHERE display_id = 'A0046';
UPDATE public.artists SET instagram = 'ps_narkao'         WHERE display_id = 'A0048';

-- 4. Corregge il nome artista errato (doppia t)
UPDATE public.artists SET name = 'Lilliofthesea' WHERE display_id = 'A0029';

-- Verifica
SELECT display_id, name, instagram
FROM public.artists
ORDER BY display_id;
