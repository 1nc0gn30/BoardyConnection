import { AlertCircle, CalendarCheck, CheckCircle2, Users } from 'lucide-react';
import { ConnectionRecord } from '../types/connection';

interface DashboardStatsProps {
  connections: ConnectionRecord[];
  onSelectActionNeededFilter: () => void;
}

export function DashboardStats({
  connections,
  onSelectActionNeededFilter,
}: DashboardStatsProps) {
  const total = connections.length;
  const needsUpdate = connections.filter((c) => c.needsUpdate).length;
  const scheduledOrMet = connections.filter(
    (c) => c.status === 'scheduled' || c.status === 'met'
  ).length;
  const connected = connections.filter((c) => c.status === 'connected').length;

  return (
    <div id="dashboard-stats-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Connections */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Connections</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{total}</p>
        </div>
      </div>

      {/* Needs Your Update */}
      <button
        type="button"
        onClick={onSelectActionNeededFilter}
        className={`p-4 rounded-xl border transition-all text-left flex items-center gap-3.5 cursor-pointer ${
          needsUpdate > 0
            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-xs hover:border-amber-400'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            needsUpdate > 0
              ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            Needs Your Update
            {needsUpdate > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
            )}
          </p>
          <p
            className={`text-xl font-bold ${
              needsUpdate > 0
                ? 'text-amber-900 dark:text-amber-200'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {needsUpdate}
          </p>
        </div>
      </button>

      {/* Scheduled / Met */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scheduled / Met</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{scheduledOrMet}</p>
        </div>
      </div>

      {/* Connected */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Connected</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{connected}</p>
        </div>
      </div>
    </div>
  );
}
