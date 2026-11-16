// 雪の夜の街と、空に手を伸ばす雪だるま。会話量（0〜100%）に合わせて、地面の雪が積もっていく。
// 雪だるまは雪の上に立っていて、積雪と一緒に持ち上がる。
// 文字列を組み立てるだけ（読み込みなし）。node の型取り除き機能でもそのまま動く。

const W = 1600
const H = 1000

/** 同じ見た目を毎回作るための、決まった並びの乱数。 */
function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** 地面の雪の上の線：ゆるい波。 */
function snowTop(y: number, rand: () => number): string {
  const points: string[] = []
  const steps = 16
  for (let i = 0; i <= steps; i += 1) {
    const x = (W / steps) * i
    const wave = Math.sin(i * 0.9) * 10 + (rand() - 0.5) * 12
    points.push(`${x.toFixed(0)},${(y + wave).toFixed(1)}`)
  }
  return `M0,${H} L${points.join(' L')} L${W},${H} Z`
}

type House = { x: number; w: number; h: number; roof: number; color: string }

const HOUSES: House[] = [
  { x: 20, w: 190, h: 230, roof: 90, color: '#2b3354' },
  { x: 230, w: 150, h: 300, roof: 80, color: '#323b60' },
  { x: 1120, w: 170, h: 250, roof: 90, color: '#2e365a' },
  { x: 1305, w: 130, h: 330, roof: 70, color: '#28304e' },
  { x: 1450, w: 150, h: 220, roof: 80, color: '#323b60' },
]

const TREES: number[] = [440, 1040]

function house(hs: House, ground: number, roofSnow: number): string {
  const top = ground - hs.h
  const peak = top - hs.roof
  const cx = hs.x + hs.w / 2
  const windows: string[] = []
  const cols = Math.max(1, Math.floor(hs.w / 55))
  const rows = Math.max(1, Math.floor(hs.h / 60))
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const wx = hs.x + 18 + c * ((hs.w - 36) / cols) + 6
      const wy = top + 22 + r * 55
      windows.push(`<rect class="win" x="${wx.toFixed(0)}" y="${wy}" width="22" height="26" rx="2"/>`)
    }
  }
  return `
  <g>
    <rect x="${hs.x}" y="${top}" width="${hs.w}" height="${hs.h + 400}" fill="${hs.color}"/>
    <polygon points="${hs.x - 10},${top} ${cx},${peak} ${hs.x + hs.w + 10},${top}" fill="#1d2440"/>
    <polygon points="${hs.x - 12},${top + 2} ${cx},${peak - roofSnow} ${hs.x + hs.w + 12},${top + 2} ${cx},${peak + 6}" fill="#eef3ff" opacity="0.95"/>
    ${windows.join('')}
  </g>`
}

function tree(x: number, ground: number): string {
  return `
  <g fill="#1b2a3c">
    <rect x="${x - 6}" y="${ground - 30}" width="12" height="430"/>
    <polygon points="${x - 80},${ground - 20} ${x},${ground - 220} ${x + 80},${ground - 20}"/>
    <polygon points="${x - 65},${ground - 120} ${x},${ground - 320} ${x + 65},${ground - 120}"/>
    <polygon points="${x - 30},${ground - 250} ${x},${ground - 316} ${x + 30},${ground - 250}" fill="#e9effc"/>
  </g>`
}

function flakes(): string {
  const rand = seeded(7)
  const out: string[] = []
  for (let i = 0; i < 90; i += 1) {
    const x = rand() * W
    const r = 1.6 + rand() * 3.2
    const speed = i % 3
    const delay = -(rand() * 18).toFixed(2)
    const drift = (rand() * 60 - 30).toFixed(0)
    out.push(
      `<circle class="f f${speed}" cx="${x.toFixed(0)}" cy="-20" r="${r.toFixed(1)}" style="animation-delay:${delay}s;--d:${drift}px"/>`,
    )
  }
  return out.join('')
}

/** 雪だるま：シルクハット、長いにんじんの鼻、赤いマフラー、オレンジの手袋で空に手を伸ばす。足もとを原点にして描く。 */
function snowman(): string {
  return `
  <ellipse cx="10" cy="4" rx="95" ry="12" fill="#0e1328" opacity="0.45"/>
  <circle cx="0" cy="-95" r="98" fill="#f4f7ff"/>
  <circle cx="-6" cy="-250" r="72" fill="#f4f7ff"/>
  <circle cx="-14" cy="-385" r="62" fill="#f4f7ff"/>
  <circle cx="22" cy="-268" r="7" fill="#c8452f"/>
  <circle cx="34" cy="-226" r="7" fill="#c8452f"/>
  <path d="M-30,-322 Q-10,-300 40,-318 L44,-300 Q-6,-280 -40,-302 Z" fill="#c8452f"/>
  <path d="M-36,-306 L-58,-190 L-12,-182 L-4,-300 Z" fill="#b83a26"/>
  <path d="M-52,-214 L-14,-208" stroke="#e7826f" stroke-width="3"/>
  <circle cx="-34" cy="-400" r="5" fill="#1b1b1b"/>
  <circle cx="-6" cy="-404" r="5" fill="#1b1b1b"/>
  <path d="M2,-392 L120,-470 L8,-376 Z" fill="#e2622f"/>
  <g transform="translate(-40,-438) rotate(-18)">
    <rect x="-52" y="0" width="104" height="12" rx="3" fill="#0d0d12"/>
    <rect x="-34" y="-58" width="68" height="60" rx="4" fill="#0d0d12"/>
  </g>
  <path d="M60,-258 Q150,-330 210,-420" stroke="#a07c5a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g transform="translate(214,-430) rotate(20)">
    <path d="M-16,14 L-18,-12 Q-18,-26 -6,-26 L-6,-40 Q-6,-48 0,-48 Q6,-48 6,-40 L6,-26 L10,-36 Q14,-42 18,-36 L16,-10 Q16,14 2,16 Z" fill="#e2622f"/>
  </g>
  <path d="M-70,-250 Q-110,-180 -96,-80" stroke="#a07c5a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g transform="translate(-96,-66) rotate(4)">
    <path d="M-18,-16 L18,-16 L20,10 Q20,22 6,22 L-12,22 Q-22,22 -22,10 Z" fill="#e2622f"/>
    <path d="M-16,-10 L16,-10" stroke="#f3a07a" stroke-width="2" stroke-dasharray="3 4"/>
  </g>`
}

/** percent：会話量 0〜100。雪の高さは画面下から 4% → 48% まで上がる（100%で家がほぼ埋まる）。 */
export function snowTownSvg(percent: number): string {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  const baseGround = H - 60
  const depth = 40 + Math.pow(p / 100, 1.15) * (H * 0.48 - 40)
  const snowY = H - depth
  const roofSnow = 4 + (p / 100) * 30
  const rand = seeded(11)

  const town = HOUSES.map(hs => house(hs, baseGround, roofSnow)).join('') + TREES.map(x => tree(x, baseGround)).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0c1024"/><stop offset="0.6" stop-color="#18203e"/><stop offset="1" stop-color="#26305a"/>
  </linearGradient>
  <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#c9d4ef"/>
  </linearGradient>
  <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.5"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
  <linearGradient id="footShade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b1024" stop-opacity="0"/><stop offset="0.55" stop-color="#0b1024" stop-opacity="0.55"/><stop offset="1" stop-color="#0b1024" stop-opacity="0.8"/>
  </linearGradient>
</defs>
<style>
  .win{fill:#ffcf6e;animation:flicker 6s ease-in-out infinite}
  .win:nth-of-type(3n){animation-delay:-2s}
  .f{fill:#ffffff;opacity:.85;animation:fall linear infinite}
  .f0{animation-duration:14s}.f1{animation-duration:19s;opacity:.6}.f2{animation-duration:24s;opacity:.45}
  @keyframes fall{from{transform:translate(0,0)}50%{transform:translate(var(--d),520px)}to{transform:translate(0,1060px)}}
  @keyframes flicker{0%,100%{opacity:1}50%{opacity:.78}}
  @media (prefers-reduced-motion: reduce){.f,.win{animation:none}}
</style>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="1380" cy="150" r="140" fill="url(#moonGlow)"/>
<circle cx="1380" cy="150" r="46" fill="#fff4d0"/>
${town}
<path d="${snowTop(snowY, rand)}" fill="url(#snow)"/>
<g transform="translate(760,${(snowY + 4).toFixed(1)}) scale(0.42)">${snowman()}</g>
${flakes()}
<rect x="0" y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="url(#footShade)"/>
</svg>`
}
