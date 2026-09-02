export interface SecretPair {
  label: string;
  members: string[];
}

// Coppie di artisti che condividono una singola tile.
// Raccogliendo tutti i timbri della coppia si sblocca un obiettivo segreto.
export const SECRET_PAIRS: SecretPair[] = [
  { label: "K&K", members: ["Kaimy", "Kiyo"] },
];

/**
 * Calcola il conteggio effettivo dei timbri deducendo 1 per ogni coppia
 * in cui entrambi gli artisti sono stati timbrati.
 * Es: Kaimy + Kiyo timbrati = 1 solo timbro effettivo.
 */
export function getEffectiveStampCount(totalStamps: number, scannedArtistNames: string[]): number {
  let deduction = 0;
  for (const pair of SECRET_PAIRS) {
    const allScanned = pair.members.every((name) =>
      scannedArtistNames.some((n) => n.toLowerCase() === name.toLowerCase())
    );
    if (allScanned) deduction += 1;
  }
  return totalStamps - deduction;
}