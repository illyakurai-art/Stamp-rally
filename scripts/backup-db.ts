import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, readFile } from "fs/promises";
import { join } from "path";

const tables = [
  "profiles",
  "artists",
  "stamps",
  "redeems",
  "notifications",
  "redeem_cards",
  "stand_inventory",
  "app_config",
] as const;

async function loadEnv() {
  try {
    const env = await readFile(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not found
  }
}

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const folderName = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const backupDir = join(process.cwd(), "backups", folderName);
  await mkdir(backupDir, { recursive: true });

  console.log(`Backup in corso in: backups/${folderName}\n`);

  const summary: Record<string, number> = {};

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact" });

    if (error) {
      console.error(`  Errore su "${table}": ${error.message}`);
      continue;
    }

    const filePath = join(backupDir, `${table}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    summary[table] = count ?? data?.length ?? 0;
    console.log(`  ✓ ${table}: ${summary[table]} record`);
  }

  const summaryPath = join(backupDir, "summary.json");
  await writeFile(
    summaryPath,
    JSON.stringify(
      {
        timestamp: now.toISOString(),
        totalTables: tables.length,
        records: summary,
        totalRecords: Object.values(summary).reduce((a, b) => a + b, 0),
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\nBackup completato: ${Object.values(summary).reduce((a, b) => a + b, 0)} record totali`);
  console.log(`Cartella: backups/${folderName}`);
}

main().catch((err) => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
