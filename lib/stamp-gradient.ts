// Gradienti esatti dello stamp/timbro (vedi PrizeInfoCard GRADIENTS e
// getCurrentTier): mapping numbero di timbri → gradiente pieno.

export const STAMP_GRADIENTS: string[] = [
  "linear-gradient(to right, #5BC0EB 0%, #7BC67E 100%)", // 5  azzurro → verdino
  "linear-gradient(to right, #7BC67E 0%, #F9D342 100%)", // 10 verdino → giallino
  "linear-gradient(to right, #F9D342 0%, #F5A623 100%)", // 15 giallino → arancino
  "linear-gradient(to right, #F5A623 0%, #E85D5D 100%)", // 20 arancino → rosso chiaro
  "linear-gradient(to right, #E85D5D 0%, #D94A4A 100%)", // 25 rosso chiaro → rosso carminio
  "linear-gradient(to right, #D94A4A 0%, #E88CB5 100%)", // 30 rosso carminio → rosa
  "linear-gradient(to right, #E88CB5 0%, #C9A0DC 100%)", // 35 rosa → fucsia
  "linear-gradient(to right, #C9A0DC 0%, #E88CB5 100%)", // 40 fucsia → rosa
  "linear-gradient(to right, #E88CB5 0%, #9B72CF 100%)", // 45 rosa → violetto
  "linear-gradient(to right, #9B72CF 0%, #5BC0EB 100%)", // 50 violetto → bluetto
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
  "linear-gradient(to right, rgba(91,192,235,0.25) 0%, rgba(123,198,126,0.25) 100%)", // 5
  "linear-gradient(to right, rgba(123,198,126,0.25) 0%, rgba(249,211,66,0.25) 100%)", // 10
  "linear-gradient(to right, rgba(249,211,66,0.25) 0%, rgba(245,166,35,0.25) 100%)", // 15
  "linear-gradient(to right, rgba(245,166,35,0.25) 0%, rgba(232,93,93,0.25) 100%)", // 20
  "linear-gradient(to right, rgba(232,93,93,0.25) 0%, rgba(217,74,74,0.25) 100%)", // 25
  "linear-gradient(to right, rgba(217,74,74,0.25) 0%, rgba(232,140,181,0.25) 100%)", // 30
  "linear-gradient(to right, rgba(232,140,181,0.25) 0%, rgba(201,160,220,0.25) 100%)", // 35
  "linear-gradient(to right, rgba(201,160,220,0.25) 0%, rgba(232,140,181,0.25) 100%)", // 40
  "linear-gradient(to right, rgba(232,140,181,0.25) 0%, rgba(155,114,207,0.25) 100%)", // 45
  "linear-gradient(to right, rgba(155,114,207,0.25) 0%, rgba(91,192,235,0.25) 100%)", // 50
];

export function getStampsTenueGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? TENUE_GRADIENTS[i] : "linear-gradient(135deg, rgba(91,192,235,0.2), rgba(74,168,216,0.12))";
}

// Versioni leggermente scurite e marcate, usate per le tile utenti in /admin/users.
export const DARK_STAMP_GRADIENTS: string[] = [
  "linear-gradient(to right, #4AA8D8 0%, #5DAE60 100%)", // 5
  "linear-gradient(to right, #5DAE60 0%, #E8C12A 100%)", // 10
  "linear-gradient(to right, #E8C12A 0%, #E8912D 100%)", // 15
  "linear-gradient(to right, #E8912D 0%, #D94A4A 100%)", // 20
  "linear-gradient(to right, #D94A4A 0%, #C63C3C 100%)", // 25
  "linear-gradient(to right, #C63C3C 0%, #D97AA3 100%)", // 30
  "linear-gradient(to right, #D97AA3 0%, #B88ECB 100%)", // 35
  "linear-gradient(to right, #B88ECB 0%, #D97AA3 100%)", // 40
  "linear-gradient(to right, #D97AA3 0%, #8A60BE 100%)", // 45
  "linear-gradient(to right, #8A60BE 0%, #4AA8D8 100%)", // 50
];

export function getStampsDarkGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0 ? DARK_STAMP_GRADIENTS[i] : "linear-gradient(135deg, #4AA8D8 0%, #3D96C5 100%)";
}