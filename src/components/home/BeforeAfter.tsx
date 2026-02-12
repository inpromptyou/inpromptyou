export default function BeforeAfter() {
  return (
    <div className="grid md:grid-cols-2 gap-px bg-white/[0.04] rounded-xl overflow-hidden">
      {/* Before */}
      <div className="bg-[#0C1120] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="text-[11px] font-mono text-red-400/70 uppercase tracking-wider">Old way</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-4">45-minute interview</h3>
        <ul className="space-y-3 text-[13px] text-gray-500">
          <li className="flex gap-2.5 items-start">
            <span className="text-red-400/60 mt-px shrink-0">✕</span>
            <span>&ldquo;Tell me about a time you used AI&rdquo;</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-400/60 mt-px shrink-0">✕</span>
            <span>Subjective interviewer notes</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-400/60 mt-px shrink-0">✕</span>
            <span>No standardization across candidates</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-red-400/60 mt-px shrink-0">✕</span>
            <span>Résumé claims you can&apos;t verify</span>
          </li>
        </ul>
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-600">~45</span>
            <span className="text-[11px] text-gray-600">min per candidate</span>
          </div>
        </div>
      </div>

      {/* After */}
      <div className="bg-[#0C1120] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
          <span className="text-[11px] font-mono text-emerald-400/70 uppercase tracking-wider">InpromptiFy</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-4">5-minute test, objective score</h3>
        <ul className="space-y-3 text-[13px] text-gray-500">
          <li className="flex gap-2.5 items-start">
            <span className="text-emerald-400/80 mt-px shrink-0">✓</span>
            <span>Hands-on task with a real AI model</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-emerald-400/80 mt-px shrink-0">✓</span>
            <span>Automated PromptScore 0–100</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-emerald-400/80 mt-px shrink-0">✓</span>
            <span>Every candidate, same conditions</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-emerald-400/80 mt-px shrink-0">✓</span>
            <span>Detailed analytics on technique</span>
          </li>
        </ul>
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">~5</span>
            <span className="text-[11px] text-gray-500">min per candidate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
