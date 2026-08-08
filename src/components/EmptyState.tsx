import { Plus, RotateCcw, Search, Sparkles, Users } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenAddModal: () => void;
  onLoadSampleData: () => void;
  onTriggerDemoLink: () => void;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onOpenAddModal,
  onLoadSampleData,
  onTriggerDemoLink,
}: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div id="empty-state-filtered" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-md mx-auto my-8">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          No matching connections
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          No records match your active status filter or search query.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 cursor-pointer"
        >
          Reset Filters &amp; Search
        </button>
      </div>
    );
  }

  return (
    <div id="empty-state-no-records" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
        <Users className="w-7 h-7" />
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        No local connections stored
      </h2>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        Your Connection Dashboard is currently empty. Connections imported via deep links or created manually will be stored locally in this browser.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onTriggerDemoLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Test Demo Deep Link</span>
        </button>

        <button
          type="button"
          onClick={onLoadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Load Sample Records</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manually</span>
        </button>
      </div>
    </div>
  );
}
