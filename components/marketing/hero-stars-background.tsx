interface HeroStar {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  gold?: boolean;
}

const HERO_STARS: HeroStar[] = [
  { top: "8%", left: "6%", size: 2, delay: 0, duration: 2.8 },
  { top: "14%", left: "18%", size: 1, delay: 0.6, duration: 3.4, gold: true },
  { top: "22%", left: "4%", size: 1, delay: 1.2, duration: 4.1 },
  { top: "6%", left: "32%", size: 2, delay: 0.3, duration: 3.1 },
  { top: "11%", left: "48%", size: 1, delay: 1.8, duration: 2.6 },
  { top: "18%", left: "62%", size: 2, delay: 0.9, duration: 3.8, gold: true },
  { top: "9%", left: "78%", size: 1, delay: 2.1, duration: 4.4 },
  { top: "16%", left: "91%", size: 2, delay: 0.4, duration: 3.3 },
  { top: "28%", left: "88%", size: 1, delay: 1.5, duration: 2.9 },
  { top: "34%", left: "72%", size: 2, delay: 0.7, duration: 3.6 },
  { top: "42%", left: "95%", size: 1, delay: 2.4, duration: 4.2 },
  { top: "52%", left: "84%", size: 2, delay: 1.1, duration: 3.0, gold: true },
  { top: "61%", left: "70%", size: 1, delay: 0.2, duration: 3.7 },
  { top: "72%", left: "92%", size: 2, delay: 1.7, duration: 2.7 },
  { top: "84%", left: "78%", size: 1, delay: 2.8, duration: 4.0 },
  { top: "90%", left: "58%", size: 2, delay: 0.5, duration: 3.2 },
  { top: "78%", left: "44%", size: 1, delay: 1.3, duration: 3.9 },
  { top: "88%", left: "26%", size: 2, delay: 2.0, duration: 2.5, gold: true },
  { top: "68%", left: "12%", size: 1, delay: 0.8, duration: 4.3 },
  { top: "56%", left: "3%", size: 2, delay: 1.6, duration: 3.5 },
  { top: "46%", left: "16%", size: 1, delay: 2.3, duration: 2.8 },
  { top: "38%", left: "8%", size: 2, delay: 0.1, duration: 3.1 },
  { top: "31%", left: "28%", size: 1, delay: 1.9, duration: 4.1 },
  { top: "48%", left: "36%", size: 2, delay: 0.6, duration: 3.4 },
  { top: "58%", left: "52%", size: 1, delay: 2.5, duration: 2.6, gold: true },
  { top: "44%", left: "58%", size: 2, delay: 1.0, duration: 3.8 },
  { top: "26%", left: "42%", size: 1, delay: 2.2, duration: 4.0 },
  { top: "20%", left: "55%", size: 2, delay: 0.4, duration: 3.0 },
  { top: "36%", left: "68%", size: 1, delay: 1.4, duration: 3.6 },
  { top: "64%", left: "38%", size: 2, delay: 2.7, duration: 2.9 },
  { top: "74%", left: "24%", size: 1, delay: 0.9, duration: 4.2 },
  { top: "4%", left: "66%", size: 2, delay: 1.8, duration: 3.3 },
  { top: "92%", left: "8%", size: 1, delay: 2.6, duration: 3.7 },
  { top: "82%", left: "48%", size: 2, delay: 0.3, duration: 2.4, gold: true },
  { top: "50%", left: "22%", size: 1, delay: 1.2, duration: 4.5 },
  { top: "12%", left: "84%", size: 2, delay: 2.9, duration: 3.2 },
];

export function HeroStarsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(56,89,168,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_20%,rgba(212,175,55,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_15%_75%,rgba(99,102,241,0.12),transparent_55%)]" />

      {HERO_STARS.map((star, index) => (
        <span
          key={index}
          className={`hero-star absolute rounded-full ${star.gold ? "hero-star--gold" : "bg-white"}`}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      <div className="hero-shooting-star absolute left-[22%] top-[18%] h-px w-16 rotate-[25deg] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0" />
      <div className="hero-shooting-star hero-shooting-star--delayed absolute right-[18%] top-[42%] h-px w-12 -rotate-[15deg] bg-gradient-to-r from-transparent via-accent-300/70 to-transparent opacity-0" />
    </div>
  );
}
