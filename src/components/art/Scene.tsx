'use client';

import { useId, useMemo, type ReactElement } from 'react';
import type { JarArt } from '@/lib/types';
import { hashString, rng, shade } from './color';
import { JarGroup } from './Jar';

type PropKind = JarArt['props'][number];

interface Placed {
  kind: PropKind;
  x: number;
  y: number;
  rot: number;
  s: number;
  tone: number;
}

/* ── props ─────────────────────────────────────────── */

function Petal({ p }: { p: Placed }) {
  const c = ['#C44569', '#D8577A', '#B83B5E', '#E07A95'][p.tone % 4];
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`}>
      <path d="M0 0 C-9 -6 -9 -19 1 -22 C11 -20 12 -7 3 0 C2 1 1 1 0 0Z" fill={c} />
      <path d="M0 -3 C-4 -8 -3 -15 1 -18" stroke={shade(c, 0.35)} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M0 0 C-9 -6 -9 -19 1 -22" stroke={shade(c, -0.25)} strokeWidth="0.6" fill="none" opacity="0.5" />
    </g>
  );
}

function Fennel({ p }: { p: Placed }) {
  const c = ['#8C9A5B', '#A3AD6C', '#7A8A4C'][p.tone % 3];
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`}>
      <ellipse rx="6" ry="1.9" fill={c} />
      <line x1="-5" x2="5" y1="0" y2="0" stroke={shade(c, -0.3)} strokeWidth="0.5" />
    </g>
  );
}

function Saffron({ p }: { p: Placed }) {
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`} fill="none" strokeLinecap="round">
      <path d="M0 0 q6 -3 13 -1" stroke="#C0392B" strokeWidth="1.4" />
      <path d="M13 -1 l3 -1.5" stroke="#E67E22" strokeWidth="1.8" />
    </g>
  );
}

function Leaf({ p }: { p: Placed }) {
  const c = ['#4E7A3E', '#5E8C4A', '#6B9A55'][p.tone % 3];
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`}>
      <path d="M0 0 C-16 -6 -18 -28 0 -40 C18 -28 16 -6 0 0Z" fill={c} />
      <path d="M0 -2 L0 -38" stroke={shade(c, 0.3)} strokeWidth="1" />
      <path d="M0 -12 L-8 -18 M0 -20 L8 -26 M0 -26 L-7 -31" stroke={shade(c, 0.25)} strokeWidth="0.6" />
    </g>
  );
}

function Star({ p }: { p: Placed }) {
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-6" rx="2.6" ry="6" fill={i % 2 ? '#7B4A2E' : '#8E5A38'} transform={`rotate(${i * 45})`} />
      ))}
      <circle r="2" fill="#5A341F" />
    </g>
  );
}

function Cardamom({ p }: { p: Placed }) {
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`}>
      <ellipse rx="8" ry="4.2" fill="#9DB07A" />
      <path d="M-7 0 Q0 -2 7 0" stroke="#7E925D" strokeWidth="0.7" fill="none" />
      <ellipse cx="-2" cy="-1.5" rx="3" ry="1" fill="#fff" opacity="0.25" />
    </g>
  );
}

const PROP: Record<PropKind, (props: { p: Placed }) => ReactElement> = {
  rose: Petal,
  fennel: Fennel,
  saffron: Saffron,
  leaf: Leaf,
  star: Star,
  cardamom: Cardamom,
};

/** Scatter props across the tabletop band [y0, y1], avoiding the jar footprints. */
function scatter(seed: string, kinds: PropKind[], count: number, w: number, y0: number, y1: number, avoid: [number, number][]) {
  const r = rng(hashString(seed + ':props'));
  const out: Placed[] = [];
  // Every scene gets a few fennel seeds for texture.
  const pool: PropKind[] = [...kinds, ...kinds, 'fennel'];
  for (let tries = 0; out.length < count && tries < count * 6; tries++) {
    const x = r() * w;
    const y = y0 + r() * (y1 - y0);
    if (avoid.some(([a, b]) => x > a && x < b && y < y0 + (y1 - y0) * 0.55)) continue;
    const kind = pool[Math.floor(r() * pool.length)];
    out.push({ kind, x, y, rot: r() * 360, s: (kind === 'leaf' ? 0.8 : 1) * (0.75 + r() * 0.5) * (0.85 + ((y - y0) / (y1 - y0)) * 0.35), tone: Math.floor(r() * 12) });
  }
  return out.sort((a, b) => a.y - b.y);
}

/* ── table & light ─────────────────────────────────── */

function Backdrop({ w, h, tableY, wash, uid }: { w: number; h: number; tableY: number; wash: string; uid: string }) {
  const grains = useMemo(() => {
    const r = rng(hashString(uid + w));
    return Array.from({ length: 14 }, (_, i) => ({ y: tableY + 10 + i * ((h - tableY) / 14) + r() * 6, amp: 1 + r() * 3, op: 0.08 + r() * 0.12 }));
  }, [w, h, tableY, uid]);
  return (
    <>
      <defs>
        <radialGradient id={`wall-${uid}`} cx="0.3" cy="0.2" r="1">
          <stop offset="0" stopColor={shade(wash, 0.55)} />
          <stop offset="0.55" stopColor={wash} />
          <stop offset="1" stopColor={shade(wash, -0.1)} />
        </radialGradient>
        <linearGradient id={`wood-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B0764A" />
          <stop offset="0.12" stopColor="#9A6440" />
          <stop offset="1" stopColor="#6E4329" />
        </linearGradient>
        <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#wall-${uid})`} />
      {/* soft window light */}
      <polygon points={`${w * 0.05},0 ${w * 0.32},0 ${w * 0.7},${tableY} ${w * 0.38},${tableY}`} fill={`url(#light-${uid})`} opacity="0.5" />
      <polygon points={`${w * 0.38},0 ${w * 0.5},0 ${w * 0.9},${tableY} ${w * 0.76},${tableY}`} fill={`url(#light-${uid})`} opacity="0.3" />
      <rect y={tableY} width={w} height={h - tableY} fill={`url(#wood-${uid})`} />
      <rect y={tableY} width={w} height="3" fill="#D29A6A" opacity="0.8" />
      {grains.map((g, i) => (
        <path
          key={i}
          d={`M0 ${g.y} C ${w * 0.25} ${g.y - g.amp} ${w * 0.5} ${g.y + g.amp} ${w * 0.75} ${g.y - g.amp / 2} S ${w} ${g.y + g.amp} ${w} ${g.y}`}
          stroke="#4A2A17"
          strokeWidth="1"
          fill="none"
          opacity={g.op}
        />
      ))}
      <rect y={tableY} width={w} height={h - tableY} fill={`url(#light-${uid})`} opacity="0.25" />
    </>
  );
}

function JarOnTable({ art, name, seed, x, baseY, scale }: { art: JarArt; name: string; seed: string; x: number; baseY: number; scale: number }) {
  // Jar art is 200 × 260 with its base at y ≈ 246.
  return (
    <g>
      <ellipse cx={x} cy={baseY + 2} rx={78 * scale} ry={11 * scale} fill="#2E1D19" opacity="0.28" filter="url(#soft-shadow)" />
      <g transform={`translate(${x - 100 * scale} ${baseY - 246 * scale}) scale(${scale})`}>
        <JarGroup art={art} name={name} seed={seed} />
      </g>
    </g>
  );
}

/* ── public scenes ─────────────────────────────────── */

export function ProductScene({ art, name, seed, className }: { art: JarArt; name: string; seed: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const W = 400;
  const H = 500;
  const tableY = 322;
  const props = useMemo(() => scatter(seed, art.props, 18, W, tableY + 14, H - 6, [[70, 330]]), [seed, art.props]);
  const back = props.filter((p) => p.y < tableY + 70);
  const front = props.filter((p) => p.y >= tableY + 70);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${name} in a glass jar`}>
      <defs>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <Backdrop w={W} h={H} tableY={tableY} wash={art.wash} uid={uid} />
      {back.map((p, i) => {
        const C = PROP[p.kind];
        return <C key={i} p={{ ...p, s: p.s * 1.25 }} />;
      })}
      <JarOnTable art={art} name={name} seed={seed} x={W / 2} baseY={tableY + 70} scale={1.36} />
      {front.map((p, i) => {
        const C = PROP[p.kind];
        return <C key={i} p={{ ...p, s: p.s * 1.5 }} />;
      })}
    </svg>
  );
}

export interface SceneJar {
  art: JarArt;
  name: string;
  seed: string;
}

/** Wide multi-jar tablescape for the hero and editorial banners. */
export function TableScene({
  jars,
  className,
  width = 1200,
  height = 800,
  xStart = 0.52,
  xSpan = 0.4,
  tableRatio = 0.64,
  jarScale = 1,
  align = 'xMidYMid',
}: {
  jars: SceneJar[];
  className?: string;
  width?: number;
  height?: number;
  /** Horizontal band (fractions of width) the jars are spread across. */
  xStart?: number;
  xSpan?: number;
  tableRatio?: number;
  jarScale?: number;
  align?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const tableY = height * tableRatio;
  const n = jars.length;
  const k = (height / 800) * jarScale;
  const slots = jars.map((j, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = width * (xStart + t * xSpan);
    const middle = i === Math.floor(n / 2);
    return { ...j, x, scale: (middle ? 1.55 : 1.2) * k, baseY: tableY + (middle ? 64 : 40) * k };
  });
  const allProps = [...new Set(jars.flatMap((j) => j.art.props))];
  const props = useMemo(
    () => scatter(jars.map((j) => j.seed).join('|'), allProps, 34, width, tableY + 20, height - 10, slots.map((s) => [s.x - 110 * s.scale, s.x + 110 * s.scale] as [number, number])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jars.map((j) => j.seed).join('|'), width, height],
  );
  const order = [...slots].sort((a, b) => a.baseY - b.baseY);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio={`${align} slice`} role="img" aria-label="Mukhvas jars on a wooden table">
      <defs>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <Backdrop w={width} h={height} tableY={tableY} wash={jars[0]?.art.wash ?? '#F4E3D7'} uid={uid} />
      {props
        .filter((p) => p.y < tableY + 90)
        .map((p, i) => {
          const C = PROP[p.kind];
          return <C key={`b${i}`} p={{ ...p, s: p.s * 1.3 }} />;
        })}
      {order.map((s) => (
        <JarOnTable key={s.seed} art={s.art} name={s.name} seed={s.seed} x={s.x} baseY={s.baseY} scale={s.scale} />
      ))}
      {props
        .filter((p) => p.y >= tableY + 90)
        .map((p, i) => {
          const C = PROP[p.kind];
          return <C key={`f${i}`} p={{ ...p, s: p.s * 1.5 }} />;
        })}
    </svg>
  );
}
