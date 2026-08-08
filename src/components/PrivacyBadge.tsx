import { ShieldCheck, HardDrive, Info } from 'lucide-react';

interface PrivacyBadgeProps {
  onClickInfo?: () => void;
}

export function PrivacyBadge({ onClickInfo }: PrivacyBadgeProps) {
  return (
    <div
      id="privacy-badge"
      className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>
        <strong>100% Private &amp; Local:</strong> Data stored strictly in browser localStorage.
      </span>
      {onClickInfo && (
        <button
          type="button"
          onClick={onClickInfo}
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white underline cursor-pointer"
          title="View data loss protection & privacy notice"
        >
          <Info className="w-3 h-3" />
          <span>Storage Info</span>
        </button>
      )}
      <HardDrive className="w-3.5 h-3.5 text-emerald-500 opacity-80 shrink-0" />
    </div>
  );
}
