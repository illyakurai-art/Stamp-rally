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
  "linear-gradient(135deg, #4DB8A0 0%, #3ABF0A 100%)", // 45
  "linear-gradient(135deg, #3ABF0A 0%, #C4B239 100%)", // 50 full
];

export function getStampsGradientIndex(n: number): number {
  if (n >= 50) return 9;
  if (n >= 45) return 8;
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
  "linear-gradient(135deg, rgba(77,184,160,0.2) 0%, rgba(58,191,10,0.13) 100%)", // 45
  "linear-gradient(135deg, rgba(58,191,10,0.2) 0%, rgba(196,178,57,0.13) 100%)", // 50
];

export function getStampsTenueGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? TENUE_GRADIENTS[i] : "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.12))";
}

// Versioni leggermente scurite e marcate, usate per le tile utenti in /admin/users.
export const DARK_STAMP_GRADIENTS: string[] = [
  "linear-gradient(135deg, #33A90B 0%, #A6952F 100%)", // 5
  "linear-gradient(135deg, #A6952F 0%, #B67D38 100%)", // 10
  "linear-gradient(135deg, #B67D38 0%, #B95A3A 100%)", // 15
  "linear-gradient(135deg, #B95A3A 0%, #B34040 100%)", // 20
  "linear-gradient(135deg, #B34040 0%, #A55AA0 100%)", // 25
  "linear-gradient(135deg, #A55AA0 0%, #7A55A0 100%)", // 30
  "linear-gradient(135deg, #7A55A0 0%, #4D6F9E 100%)", // 35
  "linear-gradient(135deg, #4D6F9E 0%, #4D9E8C 100%)", // 40
  "linear-gradient(135deg, #4D9E8C 0%, #33A90B 100%)", // 45
  "linear-gradient(135deg, #33A90B 0%, #A6952F 100%)", // 50
];

export function getStampsDarkGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? DARK_STAMP_GRADIENTS[i] : "linear-gradient(135deg, #5A3A66 0%, #4A2F55 100%)";
}