// Gradienti esatti dello stamp/timbro (vedi PrizeInfoCard GRADIENTS e
// getCurrentTier): mapping numbero di timbri → gradiente pieno.

export const STAMP_GRADIENTS: string[] = [
  "linear-gradient(135deg, #3ABF0A 0%, #C4B239 100%)", // 5
  "linear-gradient(135deg, #C4B239 0%, #E8963E 100%)", // 10
  "linear-gradient(135deg, #E8963E 0%, #E85D3E 100%)", // 15
  "linear-gradient(135deg, #E85D3E 0%, #D93D3D 100%)", // 20
  "linear-gradient(135deg, #D93D3D 0%, #C44DB8 100%)", // 25
  "linear-gradient(135deg, #C44DB8 0%, #8B4DB8 100%)", // 30
  "linear-gradient(135deg, #8B4DB8 0%, #4D7DB8 100%)", // 35
  "linear-gradient(135deg, #4D7DB8 0%, #4DB8A0 100%)", // 40
];

export function getStampsGradientIndex(n: number): number {
  if (n >= 40) return 7;
  if (n >= 35) return 6;
  if (n >= 30) return 5;
  if (n >= 25) return 4;
  if (n >= 20) return 3;
  if (n >= 15) return 2;
  if (n >= 10) return 1;
  if (n >= 5) return 0;
  return -1;
}

export function getStampsGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? STAMP_GRADIENTS[i] : "rgba(139,92,246,0.2)";
}

export function getStampsGradientAngle(n: number): string {
  return getStampsGradient(n);
}

export const TENUE_GRADIENTS: string[] = [
  "linear-gradient(135deg, rgba(58,191,10,0.2) 0%, rgba(196,178,57,0.13) 100%)", // 5
  "linear-gradient(135deg, rgba(196,178,57,0.2) 0%, rgba(232,150,62,0.13) 100%)", // 10
  "linear-gradient(135deg, rgba(232,150,62,0.2) 0%, rgba(232,93,62,0.13) 100%)", // 15
  "linear-gradient(135deg, rgba(232,93,62,0.2) 0%, rgba(217,61,61,0.13) 100%)", // 20
  "linear-gradient(135deg, rgba(217,61,61,0.2) 0%, rgba(196,77,184,0.13) 100%)", // 25
  "linear-gradient(135deg, rgba(196,77,184,0.2) 0%, rgba(139,77,184,0.13) 100%)", // 30
  "linear-gradient(135deg, rgba(139,77,184,0.2) 0%, rgba(77,125,184,0.13) 100%)", // 35
  "linear-gradient(135deg, rgba(77,125,184,0.2) 0%, rgba(77,184,160,0.13) 100%)", // 40
];

export function getStampsTenueGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? TENUE_GRADIENTS[i] : "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.12))";
}