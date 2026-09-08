// Gradienti esatti dello stamp/timbro (vedi PrizeInfoCard GRADIENTS e
// getCurrentTier): mapping numbero di timbri → gradiente pieno.

export const STAMP_GRADIENTS: string[] = [
  "linear-gradient(135deg, #5BC0EB 0%, #4AA8D8 100%)", // 5  azzurro
  "linear-gradient(135deg, #7BC67E 0%, #5DAE60 100%)", // 10 verde
  "linear-gradient(135deg, #F9D342 0%, #E8C12A 100%)", // 15 giallo
  "linear-gradient(135deg, #F5A623 0%, #E8912D 100%)", // 20 arancio
  "linear-gradient(135deg, #F08C7A 0%, #E87A68 100%)", // 25 salmone
  "linear-gradient(135deg, #E85D5D 0%, #D94A4A 100%)", // 30 rosso
  "linear-gradient(135deg, #E88CB5 0%, #D97AA3 100%)", // 35 rosa
  "linear-gradient(135deg, #C9A0DC 0%, #B88ECB 100%)", // 40 lilla
  "linear-gradient(135deg, #9B72CF 0%, #8A60BE 100%)", // 45 violetto
  "linear-gradient(135deg, #2D1B33 0%, #1a0f20 100%)", // 50 full collection (viola scuro sito)
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
  return i >= 0 ? STAMP_GRADIENTS[i] : "rgba(91,192,235,0.2)";
}

export function getStampsGradientAngle(n: number): string {
  return getStampsGradient(n);
}

export const TENUE_GRADIENTS: string[] = [
  "linear-gradient(135deg, rgba(91,192,235,0.2) 0%, rgba(74,168,216,0.13) 100%)", // 5
  "linear-gradient(135deg, rgba(123,198,126,0.2) 0%, rgba(93,174,96,0.13) 100%)", // 10
  "linear-gradient(135deg, rgba(249,211,66,0.2) 0%, rgba(232,193,42,0.13) 100%)", // 15
  "linear-gradient(135deg, rgba(245,166,35,0.2) 0%, rgba(232,145,45,0.13) 100%)", // 20
  "linear-gradient(135deg, rgba(240,140,122,0.2) 0%, rgba(232,122,104,0.13) 100%)", // 25
  "linear-gradient(135deg, rgba(232,93,93,0.2) 0%, rgba(217,74,74,0.13) 100%)", // 30
  "linear-gradient(135deg, rgba(232,140,181,0.2) 0%, rgba(217,122,163,0.13) 100%)", // 35
  "linear-gradient(135deg, rgba(201,160,220,0.2) 0%, rgba(184,142,203,0.13) 100%)", // 40
  "linear-gradient(135deg, rgba(155,114,207,0.2) 0%, rgba(138,96,190,0.13) 100%)", // 45
  "linear-gradient(135deg, rgba(45,27,51,0.2) 0%, rgba(26,15,32,0.13) 100%)", // 50
];

export function getStampsTenueGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? TENUE_GRADIENTS[i] : "linear-gradient(135deg, rgba(91,192,235,0.2), rgba(74,168,216,0.12))";
}

// Versioni leggermente scurite e marcate, usate per le tile utenti in /admin/users.
export const DARK_STAMP_GRADIENTS: string[] = [
  "linear-gradient(135deg, #4AA8D8 0%, #3D96C5 100%)", // 5
  "linear-gradient(135deg, #5DAE60 0%, #4E9C51 100%)", // 10
  "linear-gradient(135deg, #E8C12A 0%, #D5AF22 100%)", // 15
  "linear-gradient(135deg, #E8912D 0%, #D58025 100%)", // 20
  "linear-gradient(135deg, #E87A68 0%, #D56958 100%)", // 25
  "linear-gradient(135deg, #D94A4A 0%, #C63C3C 100%)", // 30
  "linear-gradient(135deg, #D97AA3 0%, #C66891 100%)", // 35
  "linear-gradient(135deg, #B88ECB 0%, #A57CB8 100%)", // 40
  "linear-gradient(135deg, #8A60BE 0%, #7852AB 100%)", // 45
  "linear-gradient(135deg, #1a0f20 0%, #120a16 100%)", // 50
];

export function getStampsDarkGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? DARK_STAMP_GRADIENTS[i] : "linear-gradient(135deg, #4AA8D8 0%, #3D96C5 100%)";
}