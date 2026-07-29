-- ============================================================
-- STATISTICHE FINE EVENTO – Novegro Stamp-Rally
-- Query unica: esegui tutto insieme, risultati in formato righe
-- ============================================================

WITH staff AS (
  SELECT id::text AS uid, display_id FROM profiles WHERE role = 'staff'
),
artists_stats AS (
  SELECT
    a.name AS nome,
    COUNT(s.id)::text AS valore,
    'timbri_artista' AS tipo
  FROM artists a
  LEFT JOIN stamps s ON s.artist_id IN (a.id::text, a.display_id)
  WHERE a.active = true
  GROUP BY a.id, a.name, a.display_id
),
users_stats AS (
  SELECT
    p.nickname AS nome,
    COUNT(s.id)::text AS valore,
    'timbri_utente' AS tipo
  FROM profiles p
  INNER JOIN stamps s ON s.user_id IN (p.id::text, p.display_id)
  WHERE (p.role IS NULL OR p.role <> 'staff')
  GROUP BY p.id, p.nickname
),
totals AS (
  SELECT
    '---' AS nome,
    COUNT(*)::text AS valore,
    'artisti_totali' AS tipo
  FROM artists WHERE active = true
  UNION ALL
  SELECT
    '---' AS nome,
    COUNT(*)::text AS valore,
    'timbri_totali' AS tipo
  FROM stamps
  UNION ALL
  SELECT
    '---' AS nome,
    COUNT(DISTINCT s.user_id)::text AS valore,
    'partecipanti_attivi' AS tipo
  FROM stamps s
  WHERE s.user_id NOT IN (SELECT uid FROM staff WHERE uid IS NOT NULL)
    AND s.user_id NOT IN (SELECT display_id FROM staff WHERE display_id IS NOT NULL)
  UNION ALL
  SELECT
    '---' AS nome,
    COUNT(*)::text AS valore,
    'utenti_registrati' AS tipo
  FROM profiles WHERE role IS NULL OR role <> 'staff'
)
SELECT tipo, nome, valore FROM (
  SELECT tipo, nome, valore, 1 AS grp, CAST(valore AS bigint) AS ord FROM artists_stats
  UNION ALL
  SELECT tipo, nome, valore, 2 AS grp, CAST(valore AS bigint) AS ord FROM users_stats
  UNION ALL
  SELECT tipo, nome, valore, 3 AS grp, 0 AS ord FROM totals
) combined
ORDER BY grp, ord DESC;
