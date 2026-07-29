// Deterministic avatar colors — same sender always gets the same pair, and
// the palette mirrors the mock's hand-picked hues.
const AVATAR_PALETTE = [
  { bg: "#E6F6EF", fg: "#00694A" }, // green
  { bg: "#F2EFFA", fg: "#5B47B5" }, // purple
  { bg: "#FDF1E3", fg: "#A96A18" }, // amber
  { bg: "#E9F0FB", fg: "#3D5FA6" }, // blue
  { bg: "#F2F1EC", fg: "#6B7671" }, // neutral
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColorsFor(seed: string): { bg: string; fg: string } {
  return AVATAR_PALETTE[hashString(seed) % AVATAR_PALETTE.length];
}
