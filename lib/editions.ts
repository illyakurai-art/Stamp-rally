import type { SupabaseClient } from "@supabase/supabase-js";

export type EditionKey = "current" | "novegro_2026";

export type EditionDates = {
  name: string;
  start: string;
  end: string;
  isActive: boolean;
};

/**
 * Legge i range date e il nome di un'edizione da app_config.
 * Se il range non è impostato o è vuoto, isActive = false.
 */
export async function getEditionDates(
  supabase: SupabaseClient,
  edition: EditionKey
): Promise<EditionDates> {
  const prefix = edition === "current" ? "edition_current" : "edition_novegro_2026";

  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", [`${prefix}_name`, `${prefix}_start`, `${prefix}_end`]);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));

  const name = map.get(`${prefix}_name`) ?? "";
  const start = map.get(`${prefix}_start`) ?? "";
  const end = map.get(`${prefix}_end`) ?? "";
  const isActive = Boolean(start && end);

  return { name, start, end, isActive };
}

/**
 * Applica il filtro data a una query Supabase su una colonna timestamp.
 * Se il range non è valido (non attivo), la query non viene filtrata
 * e isActive = false viene restituito al chiamante.
 */
export function applyEditionFilter<T extends { gte: Function; lte: Function }>(
  query: T,
  columnName: string,
  edition: EditionDates
): T {
  if (!edition.isActive) return query;
  return query.gte(columnName, edition.start).lte(columnName, edition.end) as T;
}
