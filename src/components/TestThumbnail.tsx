"use client";

interface TestThumbnailProps {
  title: string;
  listingType?: string;
  difficulty?: string;
  model?: string;
  variant?: "card" | "banner" | "thumb";
  className?: string;
}

/** Simple string hash → 0..max */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const GRADIENTS: Record<string, string> = {
  job: "from-emerald-500 via-teal-500 to-cyan-600",
  test: "from-indigo-500 via-violet-500 to-purple-600",
  casual: "from-amber-400 via-orange-400 to-rose-500",
};

const ICONS: Record<string, string> = {
  job: "💼",
  test: "🧪",
  casual: "🎮",
};

const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-emerald-400/30 text-emerald-100",
  intermediate: "bg-blue-400/30 text-blue-100",
  advanced: "bg-amber-400/30 text-amber-100",
  expert: "bg-red-400/30 text-red-100",
};

const MODEL_SHORT: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  claude: "Claude",
  "claude-haiku": "Haiku",
  "claude-sonnet": "Sonnet",
  gemini: "Gemini",
};

const ASPECT: Record<string, string> = {
  card: "aspect-video",       // 16:9
  banner: "aspect-[3/1]",     // 3:1
  thumb: "aspect-square",     // 1:1
};

/** Build an SVG pattern unique to the title */
function patternSvg(hash: number): string {
  const variant = hash % 3;
  const size = 20 + (hash % 20);
  const opacity = 0.06 + (hash % 5) * 0.01;

  if (variant === 0) {
    // dots
    return `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${size / 2}' cy='${size / 2}' r='1.5' fill='white' fill-opacity='${opacity}'/%3E%3C/svg%3E")`;
  }
  if (variant === 1) {
    // diagonal lines
    return `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 ${size}L${size} 0' stroke='white' stroke-opacity='${opacity}' stroke-width='1'/%3E%3C/svg%3E")`;
  }
  // grid
  return `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${size} 0H0V${size}' fill='none' stroke='white' stroke-opacity='${opacity}' stroke-width='0.5'/%3E%3C/svg%3E")`;
}

export default function TestThumbnail({
  title,
  listingType = "test",
  difficulty,
  model,
  variant = "card",
  className = "",
}: TestThumbnailProps) {
  const h = hashStr(title || "untitled");
  const type = listingType in GRADIENTS ? listingType : "test";
  const gradient = GRADIENTS[type];
  const icon = ICONS[type];
  const pattern = patternSvg(h);
  const rotation = (h % 360);

  const diffLabel = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : null;
  const diffColor = DIFF_COLORS[difficulty || ""] || DIFF_COLORS.intermediate;

  const modelLabel = model ? (MODEL_SHORT[model] || model) : null;

  const isSmall = variant === "thumb";

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} ${ASPECT[variant]} ${className}`}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: pattern }}
      />

      {/* Decorative circle */}
      <div
        className="absolute rounded-full opacity-10 bg-white"
        style={{
          width: "60%",
          height: "60%",
          top: `${-10 + (h % 30)}%`,
          right: `${-15 + (h % 25)}%`,
          transform: `rotate(${rotation}deg)`,
        }}
      />
      <div
        className="absolute rounded-full opacity-[0.06] bg-white"
        style={{
          width: "40%",
          height: "40%",
          bottom: `${-5 + (h % 15)}%`,
          left: `${-10 + (h % 20)}%`,
        }}
      />

      {/* Noise grain texture */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4">
        {/* Top row: badges */}
        <div className="flex items-start justify-between">
          <div className="flex gap-1.5">
            {diffLabel && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${diffColor}`}>
                {diffLabel}
              </span>
            )}
            {modelLabel && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
                {modelLabel}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: icon + title */}
        <div className="flex items-end gap-3">
          <span
            className={`shrink-0 ${isSmall ? "text-2xl" : "text-3xl"} drop-shadow-lg`}
            role="img"
            aria-hidden
          >
            {icon}
          </span>
          <h3
            className={`text-white font-bold leading-snug line-clamp-2 drop-shadow-md ${
              isSmall ? "text-sm" : variant === "banner" ? "text-lg" : "text-base"
            }`}
          >
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
