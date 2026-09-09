// Ogni tier sfuma verso il colore del tier successivo a destra.
// Il blu compare solo sull'ultimo tier (50 timbri).

const CARD_GRADIENT_ANGLE = "135deg";
const ROW_GRADIENT_ANGLE = "90deg";

/** Colore identità di ogni tier (lato sinistro della riga). */
export const TIER_ANCHORS = [
  "#2DD4BF", // 5  acquamarina
  "#14B8A6", // 10 teal
  "#22C55E", // 15 verde
  "#A3E635", // 20 lime
  "#EAB308", // 25 giallo
  "#F59E0B", // 30 ambra
  "#F97316", // 35 arancio
  "#EF4444", // 40 rosso
  "#EC4899", // 45 rosa
  "#9333EA", // 50 viola (inizio ultimo tier)
] as const;

const LAST_TIER_END = "#6366F1"; // blu — solo ultimo tier

export const TIER_THRESHOLDS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function darken(hex: string, amount = 0.12): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function buildGradient(from: string, to: string, angle: string): string {
  return `linear-gradient(${angle}, ${from} 0%, ${to} 100%)`;
}

function buildTenueGradient(
  from: string,
  to: string,
  angle: string,
  opacityFrom: number,
  opacityTo: number
): string {
  const [r1, g1, b1] = parseHex(from);
  const [r2, g2, b2] = parseHex(to);
  return `linear-gradient(${angle}, rgba(${r1},${g1},${b1},${opacityFrom}) 0%, rgba(${r2},${g2},${b2},${opacityTo}) 100%)`;
}

function getTierColorPair(index: number): [string, string] {
  const from = TIER_ANCHORS[index];
  const to =
    index < TIER_ANCHORS.length - 1
      ? TIER_ANCHORS[index + 1]
      : LAST_TIER_END;
  return [from, to];
}

export const STAMP_GRADIENTS: string[] = TIER_ANCHORS.map((_, i) => {
  const [from, to] = getTierColorPair(i);
  return buildGradient(from, to, CARD_GRADIENT_ANGLE);
});

/** Gradienti orizzontali per le righe milestone (sinistra → destra verso il tier successivo). */
export const STAMP_ROW_GRADIENTS: string[] = TIER_ANCHORS.map((_, i) => {
  const [from, to] = getTierColorPair(i);
  return buildGradient(from, to, ROW_GRADIENT_ANGLE);
});

export const TENUE_GRADIENTS: string[] = TIER_ANCHORS.map((_, i) => {
  const [from, to] = getTierColorPair(i);
  return buildTenueGradient(from, to, CARD_GRADIENT_ANGLE, 0.2, 0.13);
});

export const DARK_STAMP_GRADIENTS: string[] = TIER_ANCHORS.map((_, i) => {
  const [from, to] = getTierColorPair(i);
  return buildGradient(darken(from), darken(to), CARD_GRADIENT_ANGLE);
});

export function getTierRowBackground(
  index: number,
  reached: boolean
): string {
  const [from, to] = getTierColorPair(Math.min(index, TIER_ANCHORS.length - 1));
  return reached
    ? buildTenueGradient(from, to, ROW_GRADIENT_ANGLE, 0.38, 0.28)
    : buildTenueGradient(from, to, ROW_GRADIENT_ANGLE, 0.14, 0.09);
}

export function getTierAnchorColor(stamps: number): string {
  const i = getStampsGradientIndex(stamps);
  return i >= 0 ? TIER_ANCHORS[i] : TIER_ANCHORS[0];
}

export function getTierRowBackgroundByStamps(
  stamps: number,
  reached = true
): string {
  const i = getStampsGradientIndex(stamps);
  if (i < 0) return "hsl(var(--foreground) / 0.05)";
  return getTierRowBackground(i, reached);
}

export function getTierBadgeStyles(stamps: number): {
  background: string;
  color: string;
} {
  const anchor = getTierAnchorColor(stamps);
  const [r, g, b] = parseHex(anchor);
  return {
    background: `rgba(${r}, ${g}, ${b}, 0.2)`,
    color: anchor,
  };
}

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
  return i >= 0 ? STAMP_GRADIENTS[i] : "rgba(45,212,191,0.2)";
}

export function getStampsGradientAngle(n: number): string {
  return getStampsGradient(n);
}

export function getStampsTenueGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0
    ? TENUE_GRADIENTS[i]
    : "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(34,197,94,0.12))";
}

export function getStampsDarkGradient(n: number): string {
  const i = getStampsGradientIndex(n);
  return i >= 0
    ? DARK_STAMP_GRADIENTS[i]
    : "linear-gradient(135deg, #28BFA9 0%, #1EAE52 100%)";
}

export function tierBaseColor(gradient: string): string {
  return gradient.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#000000";
}
