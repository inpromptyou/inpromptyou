// Design System — InpromptiFy Dashboard
// Shared style constants for a premium, hand-crafted feel

export const ds = {
  // Layout
  page: "px-6 lg:px-10 py-8 max-w-[1200px]",
  
  // Typography
  pageTitle: "text-[22px] font-semibold text-gray-900 tracking-[-0.02em]",
  pageSubtitle: "text-[13px] text-gray-400 mt-1 tracking-[0.01em]",
  sectionLabel: "text-[11px] font-medium text-gray-400 uppercase tracking-[0.08em]",
  sectionTitle: "text-[15px] font-semibold text-gray-900 tracking-[-0.01em]",
  tableHeader: "text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em]",
  
  // Cards & Surfaces
  card: "bg-white border border-gray-200/80 rounded-lg transition-all duration-200",
  cardHover: "bg-white border border-gray-200/80 rounded-lg transition-all duration-200 hover:border-gray-300 hover:shadow-sm",
  flatSection: "border-b border-gray-100 pb-6 mb-6",
  
  // Status dots
  statusDot: {
    active: "w-1.5 h-1.5 rounded-full bg-emerald-500",
    warning: "w-1.5 h-1.5 rounded-full bg-amber-400",
    error: "w-1.5 h-1.5 rounded-full bg-red-400",
    inactive: "w-1.5 h-1.5 rounded-full bg-gray-300",
    draft: "w-1.5 h-1.5 rounded-full bg-gray-300",
  },
  
  // Buttons
  btnPrimary: "inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-[13px] font-medium transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/10",
  btnSecondary: "inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-md px-4 py-2 text-[13px] font-medium text-gray-700 transition-all duration-200 hover:shadow-sm",
  btnGhost: "inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200",
  
  // Inputs
  input: "w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200",
  inputLabel: "block text-[12px] font-medium text-gray-500 mb-1.5 tracking-[0.02em]",
  inputError: "text-[11px] text-red-500 mt-1",
  
  // Tables
  tableRow: "hover:bg-gray-50/80 transition-colors duration-150",
  tableCell: "px-5 py-3 text-[13px]",
  tableCellMuted: "px-5 py-3 text-[13px] text-gray-400",
  
  // Sidebar
  sidebarBg: "bg-[#0B1120]",
  sidebarItem: "flex items-center gap-2.5 px-3 py-2 text-[13px] transition-all duration-200 rounded-md",
  sidebarItemActive: "text-white bg-white/[0.06] border-l-2 border-indigo-400 -ml-px pl-[11px]",
  sidebarItemInactive: "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]",
  sidebarGroupLabel: "text-[10px] font-semibold text-gray-600 uppercase tracking-[0.1em] px-3 mb-1",
  
  // Badges & indicators
  scoreBadge: (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  },
  
  scoreRingColor: (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  },
  
  // Micro sparkline data (for demo purposes — generates fake trend)
  fakeTrend: (current: number, length = 7): number[] => {
    const points: number[] = [];
    let val = current * 0.7;
    for (let i = 0; i < length; i++) {
      val += (current - val) * 0.3 + (Math.random() - 0.4) * current * 0.1;
      points.push(Math.round(Math.max(0, val)));
    }
    points[length - 1] = current;
    return points;
  },
} as const;

// SVG Sparkline component helper — returns path d attribute
export function sparklinePath(data: number[], width: number, height: number): string {
  if (data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  
  return data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * height * 0.8 - height * 0.1;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

// Progress ring SVG helper
export function progressRing(percent: number, size: number, strokeWidth: number) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return { radius, circumference, offset, cx: size / 2, cy: size / 2 };
}
