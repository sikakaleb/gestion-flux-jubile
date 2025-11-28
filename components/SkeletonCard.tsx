export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-slate-200 p-4 flex gap-4 items-start animate-pulse">
      <div className="flex-shrink-0 text-center min-w-[60px]">
        <div className="h-8 w-14 bg-slate-200 rounded"></div>
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>

      <div className="flex-shrink-0">
        <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}
