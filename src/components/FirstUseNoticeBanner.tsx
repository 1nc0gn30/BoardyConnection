import { ShieldAlert, Download, X, HelpCircle } from 'lucide-react';

interface FirstUseNoticeBannerProps {
  onDismiss: () => void;
  onOpenBackupModal: () => void;
}

export function FirstUseNoticeBanner({
  onDismiss,
  onOpenBackupModal,
}: FirstUseNoticeBannerProps) {
  return (
    <div
      id="first-use-notice-banner"
      className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-800 dark:text-amber-200 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              Important: Records Live ONLY in This Browser&apos;s Local Storage
            </h3>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer shrink-0"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed">
            Your connections, notes, and history are stored 100% locally in this browser (<code className="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-950 dark:text-amber-100 font-mono text-xs">localStorage</code>).
            Clearing site data, clearing browser cache, switching browsers, or changing devices <strong>will permanently remove your records</strong> unless backed up.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup Now</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              I Understand &amp; Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
