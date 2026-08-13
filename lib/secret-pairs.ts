export interface SecretPair {
  label: string;
  members: string[];
}

// Coppie di artisti che condividono una singola tile.
// Raccogliendo tutti i timbri della coppia si sblocca un obiettivo segreto.
export const SECRET_PAIRS: SecretPair[] = [
  { label: "K&K", members: ["Kaimy", "Kiyo"] },
];