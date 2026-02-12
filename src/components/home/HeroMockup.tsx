export default function HeroMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0A0E1A] shadow-2xl shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1121] border-b border-white/[0.04]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
          <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
          <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-white/[0.04] rounded px-3 py-1 text-[11px] text-gray-600 font-mono max-w-xs">
            inpromptify.com/test/sandbox
          </div>
        </div>
      </div>

      {/* Sandbox UI */}
      <div className="p-4 sm:p-5">
        {/* Top bar */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 pb-3 mb-4 border-b border-white/[0.04]">
          <span className="text-gray-400 font-medium">Write a Marketing Email</span>
          <div className="hidden sm:flex gap-5 font-mono">
            <span>attempts <span className="text-white">2</span>/5</span>
            <span>tokens <span className="text-white">847</span>/2,000</span>
            <span>time <span className="text-amber-400">6:12</span></span>
          </div>
        </div>

        {/* Chat messages */}
        <div className="space-y-3 mb-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-indigo-600/90 text-white rounded-lg rounded-br-sm px-3.5 py-2.5 text-[12px] max-w-[75%] leading-relaxed">
              Write a compelling product launch email for CloudSync Pro targeting enterprise CTOs.
              Focus on data synchronization pain points and include a clear CTA.
            </div>
          </div>
          {/* AI response */}
          <div className="flex justify-start">
            <div className="bg-white/[0.03] text-gray-400 rounded-lg rounded-bl-sm px-3.5 py-2.5 text-[12px] max-w-[80%] leading-relaxed border border-white/[0.04]">
              <span className="text-[10px] text-gray-600 font-mono block mb-1.5">GPT-4o</span>
              <span className="text-gray-300">Subject:</span> Your data sync takes 23 hours/week. Let&apos;s fix that.
              <br /><br />
              Dear [Name],
              <br /><br />
              Enterprise teams lose an average of 23 hours weekly to fragmented data systems.
              CloudSync Pro delivers real-time bi-directional sync across your entire stack…
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/[0.03] rounded-md px-3 py-2 text-[12px] text-gray-600 border border-white/[0.04]">
            Refine the subject line to be more specific…
          </div>
          <div className="bg-indigo-600 text-white px-3 py-2 rounded-md text-[11px] font-medium shrink-0">
            Send
          </div>
        </div>
      </div>
    </div>
  );
}
