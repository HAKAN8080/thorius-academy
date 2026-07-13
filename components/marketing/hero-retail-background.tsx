const TREND_POINTS = [
  { x: 40, y: 330 },
  { x: 150, y: 305 },
  { x: 260, y: 318 },
  { x: 370, y: 255 },
  { x: 480, y: 268 },
  { x: 590, y: 190 },
  { x: 700, y: 205 },
  { x: 810, y: 120 },
] as const;

const TREND_PATH = TREND_POINTS.map(
  (p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`,
).join(" ");

const BARS = [
  { x: 60, height: 46, delay: 0 },
  { x: 180, height: 72, delay: 0.4 },
  { x: 300, height: 58, delay: 0.8 },
  { x: 420, height: 92, delay: 1.2 },
  { x: 540, height: 78, delay: 1.6 },
  { x: 660, height: 110, delay: 2.0 },
  { x: 780, height: 96, delay: 2.4 },
] as const;

/**
 * Hero arka planı — perakende planlama motifleri:
 * grid kağıdı, plan (hedef) çizgisi, kendini çizen satış trendi ve KPI noktaları.
 * Grafik yazı sütununun arkasında (sol) konumlanır.
 */
export function HeroRetailBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(124,58,237,0.28),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_20%,rgba(212,175,55,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_15%_80%,rgba(168,85,247,0.16),transparent_55%)]" />

      {/* Planlama grid'i — yazı tarafında (sol) */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,181,253,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,0.1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 90% at 22% 45%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 90% at 22% 45%, black 30%, transparent 75%)",
        }}
      />

      {/* Trend grafiği — yazının arkasında (sol yarı) */}
      <svg
        viewBox="0 0 860 420"
        className="absolute -left-8 top-1/2 h-[120%] w-[70%] -translate-y-1/2 opacity-90 sm:-left-6 sm:w-[58%] lg:w-[48%]"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hero-trend-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e4c55a" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#d4af37" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#f5e49e" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="hero-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Kutu grafikler — dip bölgede nefes alan stok/satış barları */}
        {BARS.map((bar) => (
          <rect
            key={bar.x}
            className="hero-chart-bar"
            x={bar.x}
            y={400 - bar.height}
            width="34"
            height={bar.height}
            rx="4"
            fill="rgba(196,181,253,0.12)"
            style={{ animationDelay: `${bar.delay}s` }}
          />
        ))}

        {/* Plan (hedef) çizgisi — kesikli, sabit */}
        <line
          x1="30"
          y1="230"
          x2="830"
          y2="150"
          stroke="rgba(196,181,253,0.32)"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />

        {/* Gerçekleşen satış trendi — kendini çizer */}
        <path
          className="hero-chart-line"
          d={TREND_PATH}
          stroke="url(#hero-trend-stroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hero-chart-area"
          d={`${TREND_PATH} L810 400 L40 400 Z`}
          fill="url(#hero-trend-fill)"
        />

        {/* KPI veri noktaları */}
        {TREND_POINTS.map((p, i) => (
          <circle
            key={p.x}
            className="hero-chart-dot"
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#f5e49e"
            style={{ animationDelay: `${2.2 + i * 0.35}s` }}
          />
        ))}

        {/* Zirve noktası — halka vurgusu */}
        <circle
          className="hero-chart-peak"
          cx="810"
          cy="120"
          r="10"
          stroke="#e4c55a"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
