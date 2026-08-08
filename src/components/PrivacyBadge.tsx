import { ShieldCheck, HardDrive } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <div
      id="privacy-badge"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>
        <strong>100% Private &amp; Local:</strong> Data stored strictly in your browser (localStorage). No tracking, no external backend.
      </span>
      <HardDrive className="w-3.5 h-3.5 text-emerald-500 opacity-80 shrink-0 ml-1" />
    </div>
  );
}
