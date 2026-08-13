import { Download, X } from 'lucide-react';
import { exportToJSON } from '../lib/connectionService';

interface BackupReminderBannerProps {
  recordCount: number;
  lastExportedAt: string | null;
  onExported: () => void;
  onDismiss: () => void;
}

export function BackupReminderBanner({
  recordCount,
  lastExportedAt,
  onExported,
  onDismiss,
}: BackupReminderBannerProps) {
  const handleQuickExport = () => {
    const jsonStr = exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connection-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onExported();
  };

  const when = lastExportedAt
    ? `Last backup ${new Date(lastExportedAt).toLocaleDateString()}`
    : 'No backup yet';

  return (
    <div
      id="backup-reminder-banner"
      className="mb-5 rounded-2xl border border-smile/20 bg-smile/8 px-3.5 py-3 sm:px-4 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <p className="text-paper/80">
        Back up {recordCount} {recordCount === 1 ? 'person' : 'people'} so a browser clear doesn’t wipe them.{' '}
        <span className="text-paper/45">{when}.</span>
      </p>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleQuickExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-smile hover:bg-[#4b8cd4] text-white font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-paper/40 hover:text-paper transition-colors cursor-pointer"
          title="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
