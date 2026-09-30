'use client';

import { useId, useMemo } from 'react';
import type { JarArt } from '@/lib/types';
import { hashString, labelName, rng, shade } from './color';

/**
 * Illustrated glass jar, drawn in a 200 × 260 box. Rendered as a <g> so scenes can place several
 * jars on one table; use <JarSvg> for a standalone image.
 */

interface Geometry {
  body: string;
  neck: { x: number; y: number; w: number; h: number };
  fillTop: number;
  label: 'rect' | 'oval';
  labelBox: { x: number; y: number; w: number; h: number };
}

const GEOMETRY: Record<Exclude<JarArt['shape'], 'box'>, Geometry> = {
  round: {
    body: 'M40 82 C40 71 48 66 60 66 L140 66 C152 66 160 71 160 82 L165 212 C166 234 151 246 128 246 L72 246 C49 246 34 234 35 212 Z',
    neck: { x: 62, y: 54, w: 76, h: 16 },
    fillTop: 98,
    label: 'rect',
    labelBox: { x: 60, y: 138, w: 80, h: 66 },
  },
  tall: {
    body: 'M58 76 L142 76 C151 76 155 81 155 90 L155 232 C155 241 149 247 139 247 L61 247 C51 247 45 241 45 232 L45 90 C45 81 49 76 58 76 Z',
    neck: { x: 66, y: 62, w: 68, h: 18 },
    fillTop: 102,
    label: 'rect',
    labelBox: { x: 62, y: 142, w: 76, h: 66 },
  },
  apothecary: {
    body: 'M77 72 L123 72 L123 88 C150 96 164 114 164 142 L164 224 C164 239 153 247 137 247 L63 247 C47 247 36 239 36 224 L36 142 C36 114 50 96 77 88 Z',
    neck: { x: 74, y: 60, w: 52, h: 16 },
    fillTop: 120,
    label: 'oval',
    labelBox: { x: 56, y: 150, w: 88, h: 68 },
  },
};

function Contents({ art, seed, clipId, fillTop }: { art: JarArt; seed: string; clipId: string; fillTop: number }) {
  const seeds = useMemo(() => {
    const r = rng(hashString(seed));
    return Array.from({ length: 190 }, () => ({
      x: 28 + r() * 144,
      y: fillTop - 3 + r() * (252 - fillTop),
      rx: 2.4 + r() * 2.4,
      ry: 1.2 + r() * 1.1,
      rot: r() * 180,
      c: art.mix[Math.floor(r() * art.mix.length)],
      round: r() < 0.22,
    }));
  }, [seed, art.mix, fillTop]);

  const base = shade(art.mix[0], -0.12);
  return (
    <g clipPath={`url(#${clipId})`}>
      <path d={`M20 ${fillTop} Q 60 ${fillTop - 5} 100 ${fillTop} T 180 ${fillTop} V 260 H 20 Z`} fill={base} />
      {seeds.map((s, i) =>
        s.round ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.ry + 0.6} fill={s.c} />
        ) : (
          <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={s.c} transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
        ),
      )}
      {/* depth: darker towards the glass edges and bottom */}
      <rect x="0" y={fillTop - 8} width="200" height={260 - fillTop + 8} fill="url(#jar-depth)" opacity="0.55" />
    </g>
  );
}

function Label({ art, name, g }: { art: JarArt; name: string; g: Geometry }) {
  const { x, y, w, h } = g.labelBox;
  const cx = x + w / 2;
  const short = labelName(name).toUpperCase();
  return (
    <g>
      {g.label === 'rect' ? (
        <>
          <rect x={x} y={y} width={w} height={h} rx="7" fill={art.label} />
          <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} rx="5" fill="none" stroke="#C9A66B" strokeWidth="0.8" opacity="0.9" />
        </>
      ) : (
        <>
          <ellipse cx={cx} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={art.label} />
          <ellipse cx={cx} cy={y + h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="none" stroke="#C9A66B" strokeWidth="0.8" />
        </>
      )}
      <text x={cx} y={y + h * 0.42} textAnchor="middle" fontFamily="Rasa, 'Noto Serif Gujarati', serif" fontWeight="700" fontSize="17" fill={art.labelInk}>
        મીઠુડી
      </text>
      <text x={cx} y={y + h * 0.58} textAnchor="middle" fontFamily="Rasa, 'Noto Serif Gujarati', serif" fontWeight="500" fontSize="8.5" fill={art.labelInk} opacity="0.85">
        મુખવાસ
      </text>
      <line x1={cx - 12} x2={cx + 12} y1={y + h * 0.66} y2={y + h * 0.66} stroke="#C9A66B" strokeWidth="0.7" />
      <text x={cx} y={y + h * 0.8} textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="500" fontSize={short.length > 14 ? 5 : 5.8} letterSpacing="1.3" fill={art.labelInk}>
        {short}
      </text>
    </g>
  );
}

function Lid({ art, shape, uid }: { art: JarArt; shape: Exclude<JarArt['shape'], 'box'>; uid: string }) {
  const lidGrad = `lid-${uid}`;
  const defs = (
    <defs>
      <linearGradient id={lidGrad} x1="0" x2="1">
        <stop offset="0" stopColor={shade(art.lid, -0.25)} />
        <stop offset="0.3" stopColor={shade(art.lid, 0.35)} />
        <stop offset="0.55" stopColor={art.lid} />
        <stop offset="1" stopColor={shade(art.lid, -0.3)} />
      </linearGradient>
    </defs>
  );
  if (shape === 'apothecary') {
    // Glass stopper with a jute twine at the neck.
    return (
      <g>
        {defs}
        <rect x="70" y="48" width="60" height="14" rx="4" fill={`url(#${lidGrad})`} />
        <ellipse cx="100" cy="36" rx="21" ry="15" fill={`url(#${lidGrad})`} />
        <ellipse cx="93" cy="31" rx="7" ry="4" fill="#fff" opacity="0.35" />
        <path d="M74 70 Q100 76 126 70" stroke="#A67C52" strokeWidth="2.2" fill="none" />
        <path d="M74 74 Q100 80 126 74" stroke="#8A6440" strokeWidth="1.6" fill="none" />
        <path d="M122 74 q8 10 2 22" stroke="#A67C52" strokeWidth="1.3" fill="none" />
        <rect x="118" y="94" width="14" height="10" rx="2" fill="#F6EDE3" stroke="#C9A66B" strokeWidth="0.6" transform="rotate(12 125 99)" />
      </g>
    );
  }
  const y = shape === 'round' ? 26 : 32;
  const h = shape === 'round' ? 32 : 32;
  const x = shape === 'round' ? 54 : 58;
  const w = shape === 'round' ? 92 : 84;
  return (
    <g>
      {defs}
      <rect x={x} y={y} width={w} height={h} rx="7" fill={`url(#${lidGrad})`} />
      {[0.28, 0.46, 0.64, 0.82].map((t) => (
        <line key={t} x1={x + 3} x2={x + w - 3} y1={y + h * t} y2={y + h * t} stroke={shade(art.lid, -0.35)} strokeWidth="0.7" opacity="0.5" />
      ))}
      <rect x={x} y={y} width={w} height={5} rx="2.5" fill="#fff" opacity="0.25" />
    </g>
  );
}

export function JarGroup({ art, name, seed }: { art: JarArt; name: string; seed: string }) {
  const uid = useId().replace(/:/g, '');
  if (art.shape === 'box') return <GiftBox art={art} name={name} seed={seed} uid={uid} />;
  const g = GEOMETRY[art.shape];
  const clipId = `body-${uid}`;
  const glassId = `glass-${uid}`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={g.body} />
        </clipPath>
        <linearGradient id={glassId} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="jar-depth" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* neck */}
      <rect {...{ x: g.neck.x, y: g.neck.y, width: g.neck.w, height: g.neck.h }} rx="3" fill="#fff" fillOpacity="0.35" stroke="#fff" strokeOpacity="0.8" />
      {/* glass back tint */}
      <path d={g.body} fill="#FFFDF9" fillOpacity="0.45" />
      <Contents art={art} seed={seed} clipId={clipId} fillTop={g.fillTop} />
      <Label art={art} name={name} g={g} />
      {/* glass front */}
      <path d={g.body} fill={`url(#${glassId})`} stroke="#fff" strokeOpacity="0.9" strokeWidth="1.6" />
      <path d={g.body} fill="none" stroke="#5C2C2C" strokeOpacity="0.14" strokeWidth="0.8" />
      <rect x="47" y={g.fillTop - 8} width="7" height="120" rx="3.5" fill="#fff" opacity="0.5" />
      <rect x="146" y={g.fillTop + 10} width="3" height="80" rx="1.5" fill="#fff" opacity="0.4" />
      <Lid art={art} shape={art.shape} uid={uid} />
    </g>
  );
}

/** Keepsake gift box with two jars peeking out behind the lid. */
function GiftBox({ art, name, seed, uid }: { art: JarArt; name: string; seed: string; uid: string }) {
  const box = art.label;
  const mini = useMemo(() => {
    const r = rng(hashString(seed));
    return [
      { x: 34, c: art.mix.slice(0, 3) },
      { x: 118, c: art.mix.slice(2, 5) },
    ].map((m) => ({
      ...m,
      dots: Array.from({ length: 40 }, (_, k) => ({ cx: m.x + 5 + r() * 38, cy: 68 + r() * 50, rot: r() * 180, fill: m.c[k % m.c.length] })),
    }));
  }, [seed, art.mix]);
  return (
    <g>
      <defs>
        <linearGradient id={`box-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(box, -0.15)} />
          <stop offset="0.5" stopColor={shade(box, 0.08)} />
          <stop offset="1" stopColor={shade(box, -0.22)} />
        </linearGradient>
        <linearGradient id={`gold-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#A9854B" />
          <stop offset="0.45" stopColor="#F0DDB1" />
          <stop offset="1" stopColor="#B08D55" />
        </linearGradient>
      </defs>
      {mini.map((m, i) => (
        <g key={i}>
          <rect x={m.x} y="54" width="48" height="66" rx="10" fill="#FFFDF9" fillOpacity="0.6" stroke="#fff" strokeWidth="1.2" />
          {m.dots.map((d, k) => (
            <ellipse key={k} cx={d.cx} cy={d.cy} rx={2.4} ry={1.3} fill={d.fill} transform={`rotate(${d.rot} ${d.cx} ${d.cy})`} />
          ))}
          <rect x={m.x + 3} y="40" width="42" height="16" rx="4" fill={`url(#gold-${uid})`} />
        </g>
      ))}
      <rect x="24" y="118" width="152" height="126" rx="6" fill={`url(#box-${uid})`} />
      <rect x="17" y="100" width="166" height="30" rx="5" fill={shade(box, -0.08)} />
      <rect x="17" y="100" width="166" height="4" rx="2" fill="#fff" opacity="0.15" />
      <rect x="92" y="100" width="16" height="144" fill={`url(#gold-${uid})`} />
      <ellipse cx="84" cy="96" rx="17" ry="8" fill="none" stroke={`url(#gold-${uid})`} strokeWidth="6" transform="rotate(-18 84 96)" />
      <ellipse cx="116" cy="96" rx="17" ry="8" fill="none" stroke={`url(#gold-${uid})`} strokeWidth="6" transform="rotate(18 116 96)" />
      <circle cx="100" cy="99" r="6" fill={`url(#gold-${uid})`} />
      <circle cx="58" cy="186" r="22" fill="none" stroke="#C9A66B" strokeWidth="0.9" />
      <text x="58" y="191" textAnchor="middle" fontFamily="Rasa, serif" fontWeight="700" fontSize="15" fill={art.labelInk}>
        મીઠુડી
      </text>
      <text x="142" y="190" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="5.6" letterSpacing="1.2" fill={art.labelInk}>
        {labelName(name).toUpperCase()}
      </text>
    </g>
  );
}

export function JarSvg({ art, name, seed, className }: { art: JarArt; name: string; seed?: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label={`${name} jar`}>
      <JarGroup art={art} name={name} seed={seed ?? name} />
    </svg>
  );
}
