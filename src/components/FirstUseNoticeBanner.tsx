import { Download, X } from 'lucide-react';

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
      className="mb-5 rounded-2xl border border-kraft/30 bg-kraft/8 px-3.5 py-3 sm:px-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-xs sm:text-sm text-kraft-bright/90 leading-relaxed">
          People and notes live only in this browser. Export a backup if you switch devices.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBackupModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kraft hover:bg-kraft-bright text-ink font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-kraft hover:text-paper transition-colors cursor-pointer"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-kraft/70 hover:text-paper transition-colors cursor-pointer"
            title="Dismiss warning"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
