export default function DashboardPreview() {
  const candidates = [
    { rank: 1, name: "Sarah Chen", score: 87, attempts: 3, tokens: 847, time: "6:12", badge: "Top 15%" },
    { rank: 2, name: "Marcus Rivera", score: 82, attempts: 4, tokens: 1203, time: "8:45", badge: "Top 25%" },
    { rank: 3, name: "Anja Petrov", score: 76, attempts: 5, tokens: 1580, time: "11:02", badge: "" },
    { rank: 4, name: "James Okafor", score: 71, attempts: 4, tokens: 1422, time: "9:33", badge: "" },
    { rank: 5, name: "Priya Nair", score: 64, attempts: 5, tokens: 1891, time: "14:20", badge: "" },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0A0E1A] overflow-hidden">
      {/* Dash header */}
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-white">Marketing Email Task</span>
          <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded">5 candidates</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="hidden sm:inline">Sort by: Score</span>
          <span className="text-gray-700">↓</span>
        </div>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[2rem_1fr_4rem_4rem_4.5rem_4rem_5rem] gap-3 px-5 py-2 text-[10px] font-mono text-gray-600 uppercase tracking-wider border-b border-white/[0.03]">
        <span>#</span>
        <span>Candidate</span>
        <span className="text-right">Score</span>
        <span className="text-right">Tries</span>
        <span className="text-right">Tokens</span>
        <span className="text-right">Time</span>
        <span className="text-right">Rank</span>
      </div>

      {/* Rows */}
      {candidates.map((c) => (
        <div
          key={c.rank}
          className={`grid grid-cols-[2rem_1fr_4rem] sm:grid-cols-[2rem_1fr_4rem_4rem_4.5rem_4rem_5rem] gap-3 px-5 py-2.5 text-[12px] items-center border-b border-white/[0.02] last:border-0 ${
            c.rank === 1 ? "bg-indigo-600/[0.04]" : "hover:bg-white/[0.01]"
          } transition-colors`}
        >
          <span className="text-gray-600 font-mono text-[11px]">{c.rank}</span>
          <span className="text-gray-300 font-medium truncate">{c.name}</span>
          <span className={`text-right font-mono font-medium ${c.score >= 80 ? "text-indigo-400" : c.score >= 70 ? "text-gray-300" : "text-gray-500"}`}>
            {c.score}
          </span>
          <span className="hidden sm:block text-right text-gray-500 font-mono">{c.attempts}</span>
          <span className="hidden sm:block text-right text-gray-500 font-mono">{c.tokens.toLocaleString()}</span>
          <span className="hidden sm:block text-right text-gray-500 font-mono">{c.time}</span>
          <span className="hidden sm:block text-right">
            {c.badge && <span className="text-[10px] text-emerald-500 font-medium">{c.badge}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
