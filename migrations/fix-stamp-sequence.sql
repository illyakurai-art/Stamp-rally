-- =====================================================
-- Fix: duplicate key violates unique constraint "stamp_pkey"
-- La sequenza stamps_id_seq si era disallineata dai valori
-- già presenti, quindi il trigger generava ID duplicati.
-- Esegui su Supabase SQL Editor (idempotente)
-- =====================================================

-- 1. Diagnosi (facoltativa) — mostra max id e valore corrente sequenza
SELECT
  MAX(id::int) AS max_id,
  last_value AS seq_last
FROM public.stamps, public.stamps_id_seq;

-- 2. Riallinea la sequenza al primo ID libero
SELECT setval(
  'stamps_id_seq',
  GREATEST(
    (SELECT COALESCE(MAX(id::int), 0) FROM public.stamps) + 1,
    1
  ),
  false
);

-- 3. Verifica finale (deve mostrare max_id+1)
SELECT last_value FROM public.stamps_id_seq;

-- Nota: il nome del constraint primario puo' essere "stamps_pkey" o
-- "stamp_pkey" a seconda della storia della tabella. Controlla con:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.stamps'::regclass AND contype = 'p';