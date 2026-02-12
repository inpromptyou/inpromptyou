import Link from "next/link";

export interface PublicTest {
  id: number;
  title: string;
  description: string;
  test_type: string;
  difficulty: string;
  time_limit_minutes: number;
  max_attempts: number;
  model: string;
  cover_image: string | null;
  listing_type: string;
  company_name: string | null;
  location: string | null;
  salary_range: string | null;
  candidates_count: number;
  avg_score: number;
  created_at: string;
  creator_name: string | null;
}

const diffColors: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-blue-50 text-blue-700",
  advanced: "bg-amber-50 text-amber-700",
  expert: "bg-red-50 text-red-700",
};

export default function PublicTestCard({ test }: { test: PublicTest }) {
  return (
    <Link href={`/test/${test.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200">
        {/* Cover image */}
        {test.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={test.cover_image} alt="" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-28 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-200">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${diffColors[test.difficulty] || diffColors.intermediate}`}>
              {test.difficulty}
            </span>
            {test.listing_type === "job" && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">Job</span>
            )}
          </div>

          <h3 className="text-[15px] font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {test.title}
          </h3>

          {test.description && (
            <p className="text-[12px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{test.description}</p>
          )}

          {test.listing_type === "job" && test.company_name && (
            <div className="text-[11px] text-indigo-600 font-medium mb-2">
              {test.company_name}
              {test.location && <span className="text-gray-400 font-normal"> · {test.location}</span>}
              {test.salary_range && <span className="text-gray-400 font-normal"> · {test.salary_range}</span>}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <span>⏱ {test.time_limit_minutes}m</span>
              <span>👥 {test.candidates_count}</span>
              {Number(test.avg_score) > 0 && <span>⭐ {Number(test.avg_score).toFixed(0)}</span>}
            </div>
            <span className="text-gray-300">{new Date(test.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
