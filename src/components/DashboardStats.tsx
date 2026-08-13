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
    <div
      id="dashboard-stats-grid"
      className="stat-strip surface rounded-2xl mb-5 overflow-hidden"
    >
      <div className="px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="text-xl font-bold text-paper tracking-tight leading-none">{total}</p>
        <p className="text-[11px] font-semibold text-paper/45 mt-1">
          {total === 1 ? 'person' : 'people'}
        </p>
      </div>

      <button
        type="button"
        onClick={onSelectActionNeededFilter}
        className={`px-4 py-3 sm:px-5 sm:py-3.5 text-left border-l border-kraft/10 cursor-pointer transition-colors ${
          needsUpdate > 0 ? 'bg-kraft/8 hover:bg-kraft/12' : 'hover:bg-white/3'
        }`}
      >
        <p
          className={`text-xl font-bold tracking-tight leading-none ${
            needsUpdate > 0 ? 'text-kraft-bright' : 'text-paper'
          }`}
        >
          {needsUpdate}
        </p>
        <p className="text-[11px] font-semibold text-paper/45 mt-1">need a note</p>
      </button>

      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-l border-kraft/10">
        <p className="text-xl font-bold text-paper tracking-tight leading-none">{scheduledOrMet}</p>
        <p className="text-[11px] font-semibold text-paper/45 mt-1">meetings</p>
      </div>

      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-l border-kraft/10">
        <p className="text-xl font-bold text-paper tracking-tight leading-none">{connected}</p>
        <p className="text-[11px] font-semibold text-paper/45 mt-1">connected</p>
      </div>
    </div>
  );
}
