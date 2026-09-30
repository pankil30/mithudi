/** Tiny deterministic helpers for the illustrated packaging. */

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — same seed, same scatter, so a product always looks the same. */
export function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lighten (amt > 0) or darken (amt < 0) a hex colour by mixing with white/black. */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const mix = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  const ch = (v: number) => Math.round(v + (mix - v) * k);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Short name for the jar label: drops the word "Mukhvas" and keeps at most two words. */
export function labelName(name: string) {
  return name
    .replace(/mukhvas/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(' ');
}
